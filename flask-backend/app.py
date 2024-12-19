from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Game Data goes here
games = [
    {"name": "Chess", "min_players": 2, "max_players": 2, "type": "strategy"},
    {"name": "Codenames", "min_players": 2, "max_players": 8, "type": "party"},
    {"name": "Dominion", "min_players": 2, "max_players": 4, "type": "deckbuilder"},
]

# Route for fetching filtered games
@app.route("/api/games", methods=["GET"])
def get_games():
    min_players = int(request.args.get("min_players", 1))
    max_players = int(request.args.get("max_players", 8))
    game_type = request.args.get("type", "")

    filtered_games = [
        game for game in games
        if game["min_players"] >= min_players
        and game["max_players"] <= max_players
        and (game_type == "" or game["type"] == game_type)
    ]

    return jsonify(filtered_games)

# Basic route to confirm the server is running
@app.route("/")
def index():
    return "Flask backend is running!"

if __name__ == "__main__":
    app.run(debug=True)
