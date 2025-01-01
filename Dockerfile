# Build C# project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-builder
WORKDIR /app/SeleniumTests
COPY SeleniumTests/ ./
RUN dotnet restore && dotnet build -c Release

# Build Go application
FROM golang:1.23.4 AS go-builder
WORKDIR /app/board-games-api
COPY board-games-api/ ./
RUN go mod tidy && go build -o app .

# Final stages to expose API
FROM ubuntu:22.04
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=go-builder /app/board-games-api/app /app/app
COPY --from=dotnet-builder /app/SeleniumTests/bin/Release/net8.0 /app/tests
ENTRYPOINT ["./app"]
EXPOSE 8080
