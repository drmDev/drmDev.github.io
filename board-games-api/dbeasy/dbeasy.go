package dbeasy

import (
    "context"
    "fmt"
    "log"
    "os"

    "github.com/jackc/pgx/v5"
)

func TestDBConnection() {
    dbURL := os.Getenv("DATABASE_PUBLIC_URL")
    if dbURL == "" {
        log.Fatal("DATABASE_PUBLIC_URL is not set in the environment")
    }

    conn, err := pgx.Connect(context.Background(), dbURL)
    if err != nil {
        log.Fatalf("Failed to connect to the database: %v", err)
    }
    defer conn.Close(context.Background())

    var result string
    err = conn.QueryRow(context.Background(), "SELECT 'Connection successful!'").Scan(&result)
    if err != nil {
        log.Fatalf("Failed to execute test query: %v", err)
    }

    fmt.Println(result)
}
