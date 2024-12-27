package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/jackc/pgx/v5"
)

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func parseOptionalInt(param string) *int {
    if param == "" {
        return nil
    }
    value, err := strconv.Atoi(param)
    if err != nil {
        return nil // Return nil if parsing fails
    }
    return &value
}

func getDBConnection() (*pgx.Conn, error) {
	dbURL := os.Getenv("DATABASE_PUBLIC_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_PUBLIC_URL is not set in the environment")
	}

	conn, err := pgx.Connect(context.Background(), dbURL)
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func queryBoardGames(ctx context.Context, conn *pgx.Conn, minPlayers, maxPlayers *int, gameType string) ([]map[string]interface{}, error) {
	query := `
        SELECT name, min_players, max_players, play_time, type, description
        FROM board_games
        WHERE ($1::INT IS NULL OR min_players >= $1::INT)
          AND ($2::INT IS NULL OR max_players <= $2::INT)
          AND (COALESCE($3::VARCHAR, '') = '' OR type = $3::VARCHAR);
    `

	rows, err := conn.Query(ctx, query, minPlayers, maxPlayers, gameType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var games []map[string]interface{}
	for rows.Next() {
		var name, gameType, description string
		var minPlayers, maxPlayers, playTime int
		if err := rows.Scan(&name, &minPlayers, &maxPlayers, &playTime, &gameType, &description); err != nil {
			return nil, err
		}
		games = append(games, map[string]interface{}{
			"name":        name,
			"min_players": minPlayers,
			"max_players": maxPlayers,
			"play_time":   playTime,
			"type":        gameType,
			"description": description,
		})
	}

	return games, nil
}

// Handler function for fetching board games
func getBoardGames(w http.ResponseWriter, r *http.Request) {
	log.Printf("Incoming request: %s %s", r.Method, r.URL.String())

	conn, err := getDBConnection()
	if err != nil {
		log.Printf("Database connection error: %v", err)
		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
		return
	}
	defer conn.Close(context.Background())

	minPlayers := parseOptionalInt(r.URL.Query().Get("min_players"))
	maxPlayers := parseOptionalInt(r.URL.Query().Get("max_players"))
	gameType := r.URL.Query().Get("type")

	// Query the database
	games, err := queryBoardGames(context.Background(), conn, minPlayers, maxPlayers, gameType)
	if err != nil {
		log.Printf("Query execution error: %v", err)
		http.Error(w, "Failed to fetch board games", http.StatusInternalServerError)
		return
	}

	// Handle no results
	if len(games) == 0 {
		log.Println("No games found for the given filters.")
		games = []map[string]interface{}{} // Return an empty list
	}

	// Respond with the fetched games
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(games)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/games", getBoardGames)
	log.Println("Server is running on port 8080...")
	http.ListenAndServe(":8080", withCORS(mux))
}
