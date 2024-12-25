package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "strconv"

    "github.com/jackc/pgx/v5"
    "github.com/rs/cors"
)

// Database connection function
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

// Function to query the database for board games
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
    conn, err := getDBConnection()
    if err != nil {
        log.Printf("Database connection error: %v", err)
        http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
        return
    }
    defer conn.Close(context.Background())

    minPlayersStr := r.URL.Query().Get("min_players")
    maxPlayersStr := r.URL.Query().Get("max_players")
    gameType := r.URL.Query().Get("type")

    // Convert parameters
    var minPlayers, maxPlayers *int
    if minPlayersStr != "" {
        minValue, err := strconv.Atoi(minPlayersStr)
        if err == nil {
            minPlayers = &minValue
        }
    }
    if maxPlayersStr != "" {
        maxValue, err := strconv.Atoi(maxPlayersStr)
        if err == nil {
            maxPlayers = &maxValue
        }
    }

    // Call the refactored query function
    games, err := queryBoardGames(context.Background(), conn, minPlayers, maxPlayers, gameType)
    if err != nil {
        log.Printf("Query execution error: %v", err)
        http.Error(w, "Failed to fetch board games", http.StatusInternalServerError)
        return
    }

    // Respond with the fetched games
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(games)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/api/games", getBoardGames)

    // Apply CORS middleware
    handler := cors.New(cors.Options{
        AllowedOrigins:   []string{"*"}, // Allow all origins
        AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
        AllowedHeaders:   []string{"Content-Type", "Authorization"},
        AllowCredentials: true,
    }).Handler(mux)

    log.Println("Server is running on port 8080...")
    http.ListenAndServe(":8080", handler)
}
