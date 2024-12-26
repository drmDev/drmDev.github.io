package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

func main() {
	// Get the database URL from the environment
	dbURL := os.Getenv("DATABASE_PUBLIC_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_PUBLIC_URL is not set in the environment")
	}

	// Connect to the database
	conn, err := pgx.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer conn.Close(context.Background())

	// Test a simple query
	var result string
	err = conn.QueryRow(context.Background(), "SELECT 'Connection successful!'").Scan(&result)
	if err != nil {
		log.Fatalf("Failed to execute test query: %v", err)
	}

	// Print success message
	fmt.Println(result)
}

