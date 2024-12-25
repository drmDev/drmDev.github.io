CREATE TABLE board_games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    play_time INTEGER,
    type VARCHAR(50),
    description TEXT
);
