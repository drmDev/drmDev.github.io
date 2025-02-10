---
layout: default
title: Hobbies
permalink: /hobbies/
---

<h1 class="mb-4"><i class="fas fa-gamepad"></i> My Hobbies</h1>

<div class="row row-cols-1 row-cols-md-2 g-4">
    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
							<h5 class="card-title"><i class="fas fa-chess-knight"></i> Chess</h5>
							{{ "Chess has become my latest obsession. It's simple to learn but impossible to master—exactly the kind of challenge I enjoy!" | markdownify }}

							<h6>Resources and Links:</h6>
							<ul class="icon-list">
									<li><i class="fas fa-chess-queen"></i> <a href="https://www.chess.com/lessons/guide" target="_blank" rel="noopener noreferrer">Chess.com Free Guides</a></li>
									<li><i class="fas fa-chess-rook"></i> <a href="https://lichess.org/learn" target="_blank" rel="noopener noreferrer">Lichess.org Interactive Guides</a></li>
									<li><i class="fas fa-chess-king"></i> <a href="https://drmdev.github.io/CCCR/" target="_blank" rel="noopener noreferrer">My modernized take on our local Rochester Community Chess Club website</a></li>
									<li><i class="fas fa-brain"></i> <a href="{{ '/puzzles' | relative_url }}" target="_blank" rel="noopener noreferrer">My Chess Woodpecker App</a></li>
							</ul>

							<h6>Latest 5 Games on Chess.com for 15/10 controls:</h6>
							<p><small class="text-info">(This data is fetched using Chess.com's public API with JavaScript.)</small></p>
							<ul id="latest-games-list" class="icon-list"></ul>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fas fa-dragon"></i> Magic: The Gathering</h5>
                {{ "I've played Magic: The Gathering since I was a kid. After a break during high school and college, I rediscovered the game as an adult, and it's now one of my favorite hobbies!" | markdownify }}

								<h6>Resources and Links:</h6>
								<ul class="icon-list">
										<li><img src="/assets/images/mtg/plains.svg" alt="Plains" width="32"> <a href="https://cubecobra.com/cube/overview/08077c8d-24d8-4e14-a571-fceff902d343" target="_blank" rel="noopener noreferrer">My MTG Cube set!</a></li>
										<li><img src="/assets/images/mtg/island.svg" alt="Island" width="32"> <a href="https://17lands.com/" target="_blank" rel="noopener noreferrer">17Lands: Improve your draft game</a></li>
								</ul>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fas fa-dice"></i> Board Games</h5>
                {{ "Board games have evolved far beyond classics like Monopoly. Twice a month, I host a game night with friends to explore modern board games!" | markdownify }}

                <h6>Explore Board Games:</h6>
                <p>Use the filters below to find games based on players and game type.</p>
                <div class="card mb-4" id="filter-board-games">
                    <div class="card-body">
                        <h5 class="card-title">Filter Board Games</h5>
                        <div class="row">
                            <div class="col-md-4">
                                <label for="min-players" class="form-label"><i class="fas fa-users"></i> Minimum Players</label>
                                <input type="number" id="min-players" class="form-control" placeholder="1" min="1" max="12">
                            </div>
                            <div class="col-md-4">
                                <label for="max-players" class="form-label"><i class="fas fa-users"></i> Maximum Players</label>
                                <input type="number" id="max-players" class="form-control" placeholder="12" min="1" max="12">
                            </div>
                            <div class="col-md-4">
                                <label for="type" class="form-label"><i class="fas fa-tag"></i> Game Type</label>
                                <select id="type" class="form-select">
                                    <option value="">All</option>
                                    <option value="Strategy">Strategy</option>
                                    <option value="Party">Party</option>
                                    <option value="Deckbuilder">Deckbuilder</option>
                                    <option value="Cooperative">Cooperative</option>
                                    <option value="Worker Placement">Worker Placement</option>
                                    <option value="Teams">Teams</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-primary mt-3" onclick="fetchBoardGames()">Filter</button>
                    </div>
                </div>
                <div id="game-list" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fas fa-stopwatch"></i> Speedrunning</h5>
                {{ "Speedrunning is one of my favorite ways to combine gaming with goal-setting. I focus on retro classics like NES and SNES games as well as modern retro-style games like *Prison City* and *Iron Meat*." | markdownify }}

                <p>Check out my runs on 
								<a href="https://www.speedrun.com/users/nescapeplan" target="_blank" rel="noopener noreferrer">Speedrun.com!</a></p>
            </div>
        </div>
    </div>
</div>

<script src="/assets/js/boardgames.js"></script>
<script src="/assets/js/chess-games.js"></script>
