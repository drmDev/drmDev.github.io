# Build C# Selenium Tests
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-builder
WORKDIR /app/SeleniumTests
COPY SeleniumTests/ ./
RUN dotnet restore && dotnet build -c Release

# Build Board Games API (Go)
FROM golang:1.23.4 AS board-games-builder
WORKDIR /app/board-games-api
COPY board-games-api/ ./
RUN go mod tidy && go build -o board-games-api-app .

# Build Chess Puzzles API (Go)
FROM golang:1.23.4 AS chesswp-builder
WORKDIR /app/chessWp
COPY chessWp/ ./
RUN go mod tidy && go build -o chessWp-app .

# Final stage: Create runtime container
FROM ubuntu:22.04
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy compiled apps
COPY --from=board-games-builder /app/board-games-api/board-games-api-app /app/board-games-api-app
COPY --from=chesswp-builder /app/chessWp/chessWp-app /app/chessWp-app
COPY --from=dotnet-builder /app/SeleniumTests/bin/Release/net8.0 /app/tests

# Expose both API ports
EXPOSE 8080 8081

# Run both APIs in parallel
CMD [ "sh", "-c", "/app/board-games-api-app & /app/chessWp-app & wait" ]

