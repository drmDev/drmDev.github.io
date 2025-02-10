---
layout: default
title: "Chess Woodpecker App"
permalink: /puzzles/
---

# Chess Woodpecker App

This tool helps you improve your pattern recognition using the "Woodpecker Method." By repeatedly solving the same set of puzzles, you'll become faster at recognizing key tactical motifs like forks, pins, and discovered attacks. This method is great for sharpening your tactical awareness and boosting your chess skills.

<div class="alert alert-warning" role="alert">
  <strong>Note:</strong> This app is still in early development, and many improvements are being worked on.
</div>

## How to Use:
1. Click the <span style="color: blue;">Start Puzzle</span> button (to begin).
2. A new tab will open with a Lichess puzzle.
3. After solving, return here and mark it as <span style="color: green;">Success</span> if you solved it correctly, or <span style="color: red;">Fail</span> if you didn't.
4. The next puzzle will load automatically once you mark the current one.

Your goal is to complete all puzzles and improve your speed over time.

## Progress Tracker
**Time Spent on Puzzles:**  
<span id="totalTime">00:00.000</span>

<div id="puzzle-container" style="text-align: center;">
  <h2 id="puzzleTitle"></h2>
  <button id="startPuzzle" class="btn">Start Puzzle</button>
  <br><br>
  <button id="successButton" class="btn" style="display: none;">Success</button>
  <button id="failButton" class="btn" style="display: none;">Fail</button>
  <p id="puzzleDetails" style="font-size: 18px; margin-top: 20px;"></p>
</div>

<script src="/assets/js/puzzles.js"></script>
