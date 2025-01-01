---
layout: default
title: Hobbies
permalink: /hobbies/
---

# My Hobbies

---

## <i class="fas fa-chess-knight"></i> Chess 

Chess has become my latest obsession. It's simple to learn but impossible to master—exactly the kind of challenge I enjoy!

### Resources and Links:
<ul>
    <li><i class="fas fa-chess-queen"></i> <a href="https://www.chess.com/lessons/guide" target="_blank" rel="noopener noreferrer">Chess.com Free Guides</a> (especially the entire Fundamentals section!)</li>
    <li><i class="fas fa-chess-rook"></i> <a href="https://www.chessable.com/courses/all/all/free/" target="_blank" rel="noopener noreferrer">Chessable.com Free Courses</a> (I recommend Chess Basics, Smithy's Opening Fundamentals, and Typical Tactical Tricks)</li>
</ul>

---

## <i class="fas fa-dragon"></i> Magic: The Gathering

I’ve been playing Magic The Gathering since I was a kid. After taking a break in high school and college, I rediscovered the game as an adult, and it has become one of my favorite hobbies.

### Resources and Links:
<ul>
    <li><img src="/assets/images/mtg/plains.svg" alt="Island" width="32"> <a href="https://cubecobra.com/cube/overview/08077c8d-24d8-4e14-a571-fceff902d343" target="_blank" rel="noopener noreferrer">My first (and only) MTG Cube set!</a></li>
    <li><img src="/assets/images/mtg/island.svg" alt="Forest" width="32"> <a href="https://17lands.com/" target="_blank" rel="noopener noreferrer">17Lands: Track your draft stats and improve your Limited game!</a></li>
</ul>

---

## <i class="fas fa-dice"></i> Board Games

Board games and tabletop games have evolved far beyond the classics like Monopoly, Clue, and Scrabble. Twice a month, I host a game night with close friends to explore modern games that bring new strategies and experiences.

### Explore Board Games
Use the filters below to find board games based on players and game type.

<div class="card mb-4" id="filter-board-games">
    <div class="card-body">
        <h5 class="card-title"> Filter Board Games</h5>
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

<div id="game-list" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
</div>

<script src="/assets/js/boardgames.js"></script>
---

## <i class="fas fa-stopwatch"></i> Speedrunning

<p>Speedrunning is one of my favorite ways to combine gaming with goal-setting and self-improvement. I focus mainly on retro classics from the NES and SNES era, as well as modern "retro-style" games like <em>Prison City</em> and <em>Iron Meat</em>.</p>

<p>What I love most about speedrunning is breaking the challenge into smaller goals—practicing individual sections until they feel smooth—before combining everything for a live run. It's a lot like a musician rehearsing parts of a song before performing the full piece. The thrill of finally nailing a full run is unmatched, and it’s a fun way to gamify games I already love playing.</p>

<p>Check out my runs and times on <i class="fas fa-video"></i> <a href="https://www.speedrun.com/users/nescapeplan" target="_blank" rel="noopener noreferrer">Speedrun.com</a>.</p>
