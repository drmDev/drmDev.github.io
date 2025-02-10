document.addEventListener("DOMContentLoaded", async function () {
    const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8081'
        : 'https://chesswoodpecker-production.up.railway.app';
    const apiUrl = `${baseUrl}/api/puzzles`;

    let puzzles = [];
    let currentPuzzleIndex = 0;
    let gameStartTime = 0;
    let totalTime = 0;
    let puzzleStartTime = 0;
    let category = "";
    let stopwatchInterval;
    let puzzleTimes = [];

    async function fetchPuzzles() {
        try {
            const response = await fetch(apiUrl);
            puzzles = await response.json();
            if (puzzles.length === 0) {
                console.error("No puzzles found");
                return;
            }
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
        gameStartTime = Date.now() - totalTime;
        stopwatchInterval = setInterval(() => {
            totalTime = Date.now() - gameStartTime;
            document.getElementById("totalTime").textContent = formatTime(totalTime);
        }, 10);
    }

    function stopStopwatch() {
        clearInterval(stopwatchInterval);
    }

    function loadPuzzle() {
        if (currentPuzzleIndex >= puzzles.length) {
            console.log("All puzzles completed! Restarting...");
            currentPuzzleIndex = 0;
            stopStopwatch();
            return;
        }

        const puzzle = puzzles[currentPuzzleIndex];
        category = puzzle.category;

        document.getElementById("puzzleTitle").textContent = `Puzzle ${currentPuzzleIndex + 1}`;
        document.getElementById("puzzleDetails").textContent = "";

        window.open(puzzle.url, '_blank');

        // Show Success and Fail buttons after the first puzzle is loaded
        document.getElementById("successButton").style.display = 'inline';
        document.getElementById("failButton").style.display = 'inline';

        puzzleStartTime = Date.now();
    }

    function logPuzzleTime(isSuccess) {
        if (!puzzleStartTime) return;

        const puzzleEndTime = Date.now();
        const elapsedTime = puzzleEndTime - puzzleStartTime;
        const formattedTime = formatTime(elapsedTime);

        const puzzleNumber = puzzleTimes.length + 1;
        puzzleTimes.push({ number: puzzleNumber, time: formattedTime, success: isSuccess });

        updatePuzzleHistory();
    }

    function updatePuzzleHistory() {
        const historyElement = document.getElementById("puzzleHistory");
        historyElement.innerHTML = "";

        puzzleTimes.forEach(puzzle => {
            const listItem = document.createElement("li");
            listItem.className = "mb-2";
            listItem.innerHTML = `
                <span class="text-light">Puzzle ${puzzle.number}:</span>
                <span class="text-info">${puzzle.time}</span>
                <span class="${puzzle.success ? "text-success" : "text-danger"}">${puzzle.success ? "✅" : "❌"}</span>
            `;
            historyElement.appendChild(listItem);
        });
    }

    document.getElementById("startPuzzle").addEventListener("click", function () {
        startStopwatch();
        loadPuzzle();
        document.getElementById("startPuzzle").style.display = 'none'; // Hide Start button
    });

    document.getElementById("successButton").addEventListener("click", function () {
        const timeTaken = Math.floor((Date.now() - puzzleStartTime) / 1000);
        document.getElementById("puzzleDetails").textContent = `You completed the puzzle in ${timeTaken} seconds. Category: ${category}`;
        
        logPuzzleTime(true);
        currentPuzzleIndex++;
        setTimeout(loadPuzzle, 2000);
    });

    document.getElementById("failButton").addEventListener("click", function () {
        const timeTaken = Math.floor((Date.now() - puzzleStartTime) / 1000);
        document.getElementById("puzzleDetails").textContent = `You failed the puzzle in ${timeTaken} seconds. Category: ${category}`;
        
        logPuzzleTime(false);
        currentPuzzleIndex++;
        setTimeout(loadPuzzle, 2000);
    });

    // Ensure Success and Fail buttons are hidden initially
    document.getElementById("successButton").style.display = 'none';
    document.getElementById("failButton").style.display = 'none';

    fetchPuzzles();
});