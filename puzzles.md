---
layout: default
title: "Chess Woodpecker App"
permalink: /puzzles/
---

<h1><i class="fa-solid fa-crow"></i> Chess Woodpecker App</h1>

{{ "This tool helps you improve your pattern recognition using the **Woodpecker Method.**  
By repeatedly solving the same set of puzzles, you'll become faster at recognizing key tactical motifs like forks, pins, skewers, and discovered attacks!" | markdownify }}

<div class="alert alert-warning" role="alert">
    {{ "**Note:** This app is still in early development, and many improvements are being worked on." | markdownify }}
</div>

<div class="card bg-dark text-light mb-4">
    <div class="card-header text-warning">
        <i class="fas fa-info-circle"></i> How to Use
    </div>
    <div class="card-body">
        {{ "
1. Click the **<span class='text-primary'>Start Session</span>** button to begin.
2. A new tab will open with a Lichess puzzle.
3. After solving, return here and mark it as  
   **<span class='text-success'>Success <i class='fas fa-check-circle'></i></span>** if correct, or  
   **<span class='text-danger'>Fail <i class='fas fa-times-circle'></i></span>** if not.
4. The next puzzle will load automatically once you mark the current one.
        " | markdownify }}
    </div>
</div>

<div id="puzzle-container" class="text-center">
    <h2 class="text-warning"><i class="fas fa-chess-knight"></i> Now Solving: <span id="puzzleTitle">Puzzle 1</span> <i class="fas fa-chess-knight"></i></h2>

    <button id="startPuzzle" class="btn btn-primary">
        Start Session
    </button>

    <br><br>

    <button id="successButton" class="btn btn-success" style="display: none;">
        <i class="fas fa-check-circle"></i> Success
    </button>
    <button id="failButton" class="btn btn-danger" style="display: none;">
        <i class="fas fa-times-circle"></i> Fail
    </button>

    <p id="puzzleDetails" class="mt-3" style="font-size: 18px;"></p>
</div>

<div class="card bg-dark text-light mt-4">
    <div class="card-header text-warning">
        <i class="fas fa-stopwatch"></i> Puzzle History
    </div>
    <div class="card-body">
        <ul id="puzzleHistory" class="list-unstyled">
            <!-- Puzzle times will be dynamically added here -->
        </ul>
				<h3 class="text-info">
            {{ "<span id='totalTime' class='display-6'>00:00.000</span>" | markdownify }}
        </h3>
    </div>
</div>

<script src="/assets/js/puzzles.js"></script>
