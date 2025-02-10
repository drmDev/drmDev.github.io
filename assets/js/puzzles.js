document.addEventListener("DOMContentLoaded", async function () {
    const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8081'
        : 'https://chesswoodpecker-production.up.railway.app';
    const apiUrl = `${baseUrl}/api/puzzles`;

    let puzzles = [];
    let currentPuzzleIndex = 0;
    let gameStartTime = 0; // Track when the user starts the first puzzle
    let totalTime = 0; // Total time spent on all puzzles
    let puzzleStartTime = 0; // Time spent on the current puzzle
    let category = ""; // Current puzzle's category
    let stopwatchInterval; // To hold the interval for stopwatch

    async function fetchPuzzles() {
        try {
            const response = await fetch(apiUrl);
            puzzles = await response.json();
            if (puzzles.length === 0) {
                console.error("No puzzles found");
                return;
            }
            // Show the "Start Puzzle" button after fetching puzzles
            document.getElementById("startPuzzle").style.display = 'inline';
        } catch (error) {
            console.error("Error fetching puzzles:", error);
        }
    }

    function formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }

    function startStopwatch() {
        gameStartTime = Date.now() - totalTime; // Adjust the start time if resuming
        stopwatchInterval = setInterval(() => {
            totalTime = Date.now() - gameStartTime; // Update total time
            document.getElementById("totalTime").textContent = formatTime(totalTime);
        }, 10); // 10ms update interval
    }

    function stopStopwatch() {
        clearInterval(stopwatchInterval);
    }

    function loadPuzzle() {
        if (currentPuzzleIndex >= puzzles.length) {
            console.log("All puzzles completed! Restarting...");
            currentPuzzleIndex = 0; // Restart when finished
            stopStopwatch(); // Stop the stopwatch when all puzzles are completed
            return;
        }

        const puzzle = puzzles[currentPuzzleIndex];
        category = puzzle.category; // Save the puzzle's category

        document.getElementById("puzzleTitle").textContent = `Puzzle ${currentPuzzleIndex + 1}`;
        document.getElementById("puzzleDetails").textContent = ""; // Clear previous puzzle details

        // Open the Lichess puzzle in a new tab
        window.open(puzzle.url, '_blank');

        // Show the Success and Fail buttons
        document.getElementById("successButton").style.display = 'inline';
        document.getElementById("failButton").style.display = 'inline';

        puzzleStartTime = Date.now(); // Start tracking time for this puzzle
    }

    document.getElementById("startPuzzle").addEventListener("click", function () {
        startStopwatch(); // Start the stopwatch
        loadPuzzle(); // Load the first puzzle
        document.getElementById("startPuzzle").style.display = 'none'; // Hide the Start button
    });

    document.getElementById("successButton").addEventListener("click", function () {
        const timeTaken = Math.floor((Date.now() - puzzleStartTime) / 1000);
        document.getElementById("puzzleDetails").textContent = `You completed the puzzle in ${timeTaken} seconds. Category: ${category}`;
        currentPuzzleIndex++;
        setTimeout(loadPuzzle, 2000); // Load the next puzzle after a short delay
    });

    document.getElementById("failButton").addEventListener("click", function () {
        const timeTaken = Math.floor((Date.now() - puzzleStartTime) / 1000);
        document.getElementById("puzzleDetails").textContent = `You failed the puzzle in ${timeTaken} seconds. Category: ${category}`;
        currentPuzzleIndex++;
        setTimeout(loadPuzzle, 2000); // Load the next puzzle after a short delay
    });

    fetchPuzzles();
});