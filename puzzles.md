---
layout: default
title: "Chess Woodpecker App"
permalink: /puzzles/
---

<h1><i class="fa-solid fa-crow"></i> Chess Woodpecker App</h1>

{{ "This tool helps you improve your pattern recognition using the **Woodpecker Method** - named after how woodpeckers repeatedly strike the same spot, just as you'll repeatedly solve the same tactical puzzles to reinforce pattern recognition. The **200-puzzle** collection features ten essential chess themes, with 20 puzzles each:

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

    <div class='category-group'>
        <h3>Attack Patterns</h3>
        <div class='category-items'>
            <span>Kingside Attack</span>
            <span>Queenside Attack</span>
        </div>
    </div>

    <div class='category-group'>
        <h3>Exploiting Weaknesses</h3>
        <div class='category-items'>
            <span>Crushing (capitalizing on blunders)</span>
            <span>Capture the Defender</span>
        </div>
    </div>

    <div class='category-group'>
        <h3>Defensive Tactics</h3>
        <div class='category-items'>
            <span>Defensive Move</span>
        </div>
    </div>
</div>

Regular practice with these puzzles will help you spot these patterns more quickly in your own games!" | markdownify }}

<div id="puzzle-container" class="text-center container-fluid">
    <!-- Controls Row -->
    <div class="row mb-3">
        <div class="col-12">
            <div class="controls-container">
                <!-- Main Controls Group -->
                <div class="control-group mb-2">
                    <button id="startPuzzle" class="btn btn-primary puzzle-btn">
                        Start Session
                    </button>
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
                    <button class="btn btn-outline-info puzzle-btn ms-2" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#howToUse" 
                            aria-expanded="false" aria-controls="howToUse">
                        <i class="fas fa-info-circle"></i> How to Use
                    </button>
                </div>
                
                <!-- How to Use Panel -->
                <div class="collapse how-to-use-panel" id="howToUse">
                    <div class="card card-body mx-auto">
                        <h6 class="text-info mb-2">Session Management:</h6>
                        <ul class="mb-0 text-start">
                            <li><strong>New Session:</strong> Get 200 random puzzles and start the timer</li>
                            <li><strong>Stop Session:</strong> Pause your progress and view your summary</li>
                            <li><strong>Resume Session:</strong> Continue from where you left off</li>
                            <li><strong>Browser Refresh:</strong> Starts a new session automatically</li>
                        </ul>
                    </div>
                </div>
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

    <!-- Message on failure -->
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
            <div id="sessionSummaryContent">
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

                    <!-- New section for Start New Session button -->
                    <div class="text-center mt-4">
                        <button id="startNewSession" class="btn btn-primary">
                            <i class="fas fa-play"></i> Start New Session
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-info" id="exportSummary">
                    <i class="fas fa-file-export"></i> Export to CSV
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<!-- Puzzle History card -->
<div id="puzzleHistoryCard" class="card bg-dark text-light mt-4">
    <div class="card-header text-warning" role="button" 
         data-bs-toggle="collapse" data-bs-target="#puzzleHistoryContent" 
         aria-expanded="true" aria-controls="puzzleHistoryContent" 
         style="cursor: pointer;">
        <div class="d-flex justify-content-between align-items-center">
            <span><i class="fas fa-stopwatch"></i> Puzzle History</span>
            <i class="fas fa-chevron-up history-toggle"></i>
        </div>
    </div>
    
    <!-- Total time display outside collapse -->
    <div class="text-center py-2">
        <h3 class="text-info mb-0">
            <span id='totalTime' class='display-6'>00:00.000</span>
        </h3>
    </div>

    <!-- History list collapsible -->
    <div class="collapse show" id="puzzleHistoryContent">
        <div class="card-body text-center pt-0">
            <ul id="puzzleHistory" class="list-unstyled mb-0">
                <!-- Puzzle times will be dynamically added here -->
            </ul>
        </div>
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
            </ul>
            <p>Have suggestions? Let me know!</p>
        </div>
    </div>
</div>

<br>
{% assign version_history = site.data.versions.puzzles %}
{% include version_history.html versions=version_history %}

<!-- Third-party libraries -->
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/duration.js"></script>
<script>
    // Extend dayjs with duration plugin
    dayjs.extend(dayjs_plugin_duration);
</script>

<!-- Application scripts -->
<script type="module" src="{{ '/assets/js/chess-wp/sounds.js' | relative_url }}"></script>
<script type="module" src="{{ '/assets/js/chess-wp/puzzles.js' | relative_url }}"></script>
