---
layout: default
title: "Chess Woodpecker App"
permalink: /puzzles/
---

<h1><i class="fa-solid fa-crow"></i> Chess Woodpecker App</h1>

{{ "This tool helps you improve your pattern recognition using the **Woodpecker Method.** By repeatedly solving the same set of puzzles, you'll become faster at recognizing key tactical motifs like forks, pins, skewers, and discovered attacks!" | markdownify }}

<div class="alert alert-warning" role="alert">
    {{ "**Note:** This app is still in early development, and many improvements are being worked on. Currently your session is only preserved for as long as you remain on this page." | markdownify }}
</div>

<div id="puzzle-container" class="text-center container-fluid">
    <!-- Control buttons row -->
    <div class="row mb-3">
        <div class="col-12 d-flex justify-content-center">
            <button id="startPuzzle" class="btn btn-primary puzzle-btn">
                Start Session
            </button>
            <button id="stopPuzzle" class="btn btn-warning puzzle-btn ms-2" style="display: none;">
                <i class="fas fa-stop-circle"></i> Stop Session
            </button>
        </div>
    </div>

    <!-- Puzzle title row -->
    <div class="row mb-3">
        <div class="col-12">
            <h2 class="text-warning puzzle-title">
                <i class="fas fa-chess-knight"></i> 
                <span class="puzzle-title-text">Now Solving: </span>
                <span id="puzzleTitle" class="ms-1">Puzzle 1</span> 
                <i class="fas fa-chess-knight"></i>
            </h2>
        </div>
    </div>

    <!-- Enhanced failure message -->
    <div id="failMessage" class="row mb-3" style="display: none;">
        <div class="col-12">
            <div class="failure-alert">
                <i class="fas fa-times-circle"></i>
                Incorrect move! Watch the correct solution.
            </div>
        </div>
    </div>

    <!-- Rest of your container... -->
    <div id="turnIndicator" class="turn-display"></div>
    <div id="chessboard" class="responsive-board"></div>
    <p id="puzzleDetails" class="mt-3" style="font-size: 18px;"></p>
</div>

<div id="puzzleHistoryCard" class="card bg-dark text-light mt-4">
    <div class="card-header text-warning">
        <i class="fas fa-stopwatch"></i> Puzzle History
    </div>
    <div class="card-body text-center">
        <ul id="puzzleHistory" class="list-unstyled">
            <!-- Puzzle times will be dynamically added here -->
        </ul>
        <h3 class="text-info">
            <span id='totalTime' class='display-6'>00:00.000</span>
        </h3>
    </div>
</div>

<div class="card bg-dark text-light mt-5">
    <div class="card-header text-warning">
        <i class="fas fa-hourglass-half"></i> Upcoming Features
    </div>
    <div class="card-body">
        <ul class="list-unstyled">
            <li><i class="fas fa-user-lock text-info"></i> Save your session progress, even if you leave the page.</li>
            <li><i class="fas fa-mobile-alt text-info"></i> Full mobile compatibility.</li>
            <li><i class="fas fa-chart-line text-info"></i> Track your improvement over time with stats.</li>
        </ul>
        <p>Have suggestions? Let me know!</p>
    </div>
</div>

<!-- Import Chessground and Chess.js from CDN -->
<script type="module">
    import { Chessground } from "https://cdnjs.cloudflare.com/ajax/libs/chessground/9.1.1/chessground.min.js";
    import { Chess } from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js";
</script>

<script src="https://cdn.jsdelivr.net/npm/dayjs@1.10.7/dayjs.min.js"></script>

<!-- Link to your puzzles.js file -->
<script type="module" src="/assets/js/puzzles.js"></script>
