# Use a multi-stage build to include both .NET and Go
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-builder
WORKDIR /app/SeleniumTests
COPY SeleniumTests/ ./
RUN dotnet restore && dotnet build -c Release

FROM golang:1.23.4 AS go-builder
WORKDIR /app/board-games-api
COPY board-games-api/ ./

# Pass the build-time ARG to this stage
ARG DATABASE_PUBLIC_URL
ENV DATABASE_PUBLIC_URL=${DATABASE_PUBLIC_URL:-default_value}

# Debugging: Log the value during the build stage
RUN echo "Build DATABASE_PUBLIC_URL=${DATABASE_PUBLIC_URL}" && \
    go mod tidy && go build -o app .

# Final stage: Combine and expose the Go app
FROM ubuntu:22.04
WORKDIR /app

# Install runtime dependencies (if necessary)
RUN apt-get update && apt-get install -y \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=go-builder /app/board-games-api/app /app/app
COPY --from=dotnet-builder /app/SeleniumTests/bin/Release/net8.0 /app/tests

# Debugging: Log the variable during runtime
RUN echo "Runtime DATABASE_PUBLIC_URL=${DATABASE_PUBLIC_URL}"

# Set the entry point for the Go app
ENTRYPOINT ["./app"]

# Expose the API on port 8080
EXPOSE 8080
