package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool

// Initialize database connection pool
func initDBPool() {
	dbURL := os.Getenv("DATABASE_PUBLIC_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_PUBLIC_URL is not set in the environment")
	}

	var err error
	dbPool, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v", err)
	}
}

// Parse integer query parameter
func parseIntQueryParam(r *http.Request, param string) *int {
	valueStr := r.URL.Query().Get(param)
	if valueStr != "" {
		if value, err := strconv.Atoi(valueStr); err == nil {
			return &value
		}
	}
	return nil
}

// Query board games from the database
func queryBoardGames(ctx context.Context, minPlayers, maxPlayers *int, gameType string) ([]map[string]interface{}, error) {
	query := `
		SELECT name, min_players, max_players, play_time, type, description
		FROM board_games
		WHERE ($1::INT IS NULL OR min_players >= $1::INT)
		  AND ($2::INT IS NULL OR max_players <= $2::INT)
		  AND (COALESCE($3::VARCHAR, '') = '' OR type = $3::VARCHAR);
	`

	rows, err := dbPool.Query(ctx, query, minPlayers, maxPlayers, gameType)
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

// Handle requests to fetch board games
func getBoardGames(w http.ResponseWriter, r *http.Request) {
	minPlayers := parseIntQueryParam(r, "min_players")
	maxPlayers := parseIntQueryParam(r, "max_players")
	gameType := r.URL.Query().Get("type")

	games, err := queryBoardGames(context.Background(), minPlayers, maxPlayers, gameType)
	if err != nil {
		log.Printf("Query execution error: %v", err)
		http.Error(w, "Failed to fetch board games", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(games)
}

func main() {
	initDBPool()
	defer dbPool.Close()

	server := &http.Server{Addr: ":8080"}
	http.HandleFunc("/api/games", getBoardGames)

	go func() {
		log.Println("Server is running on port 8080...")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe error: %v", err)
		}
	}()

	// Graceful shutdown
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt)
	<-sig

	log.Println("Shutting down server...")
	server.Shutdown(context.Background())
	log.Println("Server stopped.")
}
