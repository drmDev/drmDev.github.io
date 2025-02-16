---
layout: default
title: "Chess Woodpecker App"
permalink: /puzzles/
---

<h1><i class="fa-solid fa-crow"></i> Chess Woodpecker App</h1>

{{ "This tool helps you improve your pattern recognition using the **Woodpecker Method** - named after how woodpeckers repeatedly strike the same spot, just as you'll repeatedly solve the same tactical puzzles to reinforce pattern recognition. The **100-puzzle** collection features five essential chess themes, with 20 puzzles each:

<div class='puzzle-categories'>
    <div class='category-group'>
        <h3>Basic Tactics</h3>
        <div class='category-items'>
            <span>Pins</span>
            <span>Skewers</span>
            <span>Forks</span>
            <span>Discovered Attacks</span>
        </div>
    </div>
    
    <div class='category-group'>
        <h3>Endgame Practice</h3>
        <div class='category-items'>
            <span>Rook and Pawn Endgames</span>
        </div>
    </div>
</div>

Regular practice with these puzzles will help you spot these patterns more quickly in your own games!" | markdownify }}

<div id="googleSignInInfo" class="alert alert-info mb-3">
    <h4>About Google Sign-In</h4>
    <p>
        When you click "Sign in with Google", you'll see an authorization request from:
        <code>https://acrhtrgvkhjxbejrdgjn.supabase.co</code>
    </p>
    <p>
        This is our secure authentication provider hosted by Supabase. We only request access to:
        <ul>
            <li>Your Google account ID (to create a unique identifier)</li>
            <li>Your email address (for authentication only)</li>
        </ul>
    </p>
    <p>
        We do not store or share your personal information. Your puzzle progress will be securely tied to your account. (At a later point when I buy my own domain, the Google OAuth consent screen will display showing my app name instead.)
    </p>
</div>

<div id="authContainer" class="row mb-3">
    <div class="col-12">
        <!-- Auth status will be dynamically inserted here with matching Bootstrap styles -->
    </div>
</div>

<div id="puzzle-container" class="text-center container-fluid" style="display: none;">
    <!-- Control buttons row -->
    <div class="row mb-3">
        <div class="col-12 d-flex justify-content-center">
            <div class="control-group">
                <div id="startSessionContainer">
                    <button id="startPuzzle" class="btn btn-primary puzzle-btn">
                        Start Session
                    </button>
                </div>
                <button id="stopPuzzle" class="btn btn-warning puzzle-btn ms-2" 
                        style="display: none;">
                    <i class="fas fa-stop-circle"></i> Stop Session
                </button>
                <button id="toggleSound" class="btn puzzle-btn ms-2">
                    <i class="fas fa-volume-up"></i> Sound On
                </button>
                <button id="hintButton" class="btn btn-info puzzle-btn ms-2" 
                        style="display: none;">
                    <i class="fas fa-lightbulb"></i> Show Category
                </button>
            </div>
        </div>
    </div>

    <!-- Puzzle title row -->
    <div class="row mb-3">
        <div class="col-12">
            <h2 class="text-warning puzzle-title">
                <i class="fas fa-chess-knight"></i> 
                <span class="puzzle-title-text">Now Solving: </span>
                <span id="puzzleTitle" class="ms-1">Puzzle 1</span> 
                <span id="puzzleHint" class="text-info ms-2" style="display: none;">
                    (<i class="fas fa-tag"></i> <span id="puzzleCategory"></span>)
                </span>
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

    <div class="row">
        <div class="col-12">
            <!-- Hidden audio elements -->
            <div id="chess-audio-container" style="display: none;">
                {% assign sounds = "move,capture,check,illegal,success" | split: "," %}
                {% for sound in sounds %}
                <audio id="{{ sound }}Sound" preload="auto">
                    <source src="../assets/sounds/{{ sound }}.mp3" type="audio/mpeg">
                </audio>
                {% endfor %}
            </div>

            <!-- Turn indicator and chessboard -->
            <div id="turnIndicator" class="turn-display"></div>
            <div id="chessboard" class="responsive-board"></div>
        </div>
    </div>
</div>

<!-- Session Report Summary -->
<div class="modal fade" id="sessionSummaryModal" tabindex="-1" aria-labelledby="sessionSummaryLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content bg-dark text-light">
            <div class="modal-header">
                <h5 class="modal-title text-warning" id="sessionSummaryLabel">
                    <i class="fas fa-chart-bar"></i> Session Summary
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Overall Stats -->
                <div class="stats-section mb-4">
                    <h6 class="text-info"><i class="fas fa-calculator"></i> Overall Performance</h6>
                    <div class="stats-content" id="overallStats">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Category Stats -->
                <div class="stats-section mb-4">
                    <h6 class="text-info"><i class="fas fa-tags"></i> Performance by Category</h6>
                    <div class="stats-content" id="categoryStats">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Failed Puzzles -->
                <div class="stats-section">
                    <h6 class="text-info"><i class="fas fa-exclamation-circle"></i> Failed Puzzles</h6>
                    <div class="stats-content" id="failedPuzzles">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
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
    <div class="card-header text-warning" role="button" data-bs-toggle="collapse" 
         data-bs-target="#upcomingFeaturesContent" aria-expanded="false" 
         aria-controls="upcomingFeaturesContent" style="cursor: pointer;">
        <div class="d-flex justify-content-between align-items-center">
            <span><i class="fas fa-hourglass-half me-2"></i> Upcoming Features</span>
            <i class="fas fa-chevron-down version-toggle"></i>
        </div>
    </div>
    <div class="collapse" id="upcomingFeaturesContent">
        <div class="card-body">
            <ul class="list-unstyled">
                <li><i class="fas fa-user-lock text-info"></i> Save your session progress, even if you leave the page.</li>
                <li><i class="fas fa-file-upload text-info"></i> Import your own puzzle lists to practice.</li>
                <li><i class="fas fa-file-export text-info"></i> Export your progress and solved puzzles.</li>
            </ul>
            <p>Have suggestions? Let me know!</p>
        </div>
    </div>
</div>

<br>
{% assign version_history = site.data.versions.puzzles %}
{% include version_history.html versions=version_history %}

<!-- 
<script type="module">
    import { Chessground } from "https://cdnjs.cloudflare.com/ajax/libs/chessground/9.1.1/chessground.min.js";
    import { Chess } from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js";
</script>
-->

<!-- Third-party libraries (global scope) -->
<script src="https://unpkg.com/@supabase/supabase-js@2.39.3"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.10.7/dayjs.min.js"></script>

<!-- Application scripts -->
<script src="{{ '/assets/js/auth.js' | relative_url }}"></script>
<script type="module" src="{{ '/assets/js/sounds.js' | relative_url }}"></script>
<script type="module" src="{{ '/assets/js/puzzles.js' | relative_url }}"></script>
