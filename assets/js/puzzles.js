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

    // Check for an active session in localStorage
    const savedIndex = localStorage.getItem("currentPuzzleIndex");
    const savedTime = localStorage.getItem("totalTime");
    const savedTimes = localStorage.getItem("puzzleTimes");

    // If a previous session exists, resume it
    if (savedIndex !== null) {
        currentPuzzleIndex = parseInt(savedIndex, 10);
    }
    if (savedTime !== null) {
        totalTime = parseInt(savedTime, 10);
        document.getElementById("totalTime").textContent = formatTime(totalTime);
    }
    if (savedTimes !== null) {
        puzzleTimes = JSON.parse(savedTimes);
        updatePuzzleHistory();
    }

		function disablePuzzleButtons() {
				const successBtn = document.getElementById("successButton");
				const failBtn = document.getElementById("failButton");

				successBtn.style.pointerEvents = "none";
				failBtn.style.pointerEvents = "none";
				successBtn.style.opacity = "0.5";
				failBtn.style.opacity = "0.5";
		}

		function enablePuzzleButtons() {
				const successBtn = document.getElementById("successButton");
				const failBtn = document.getElementById("failButton");

				successBtn.style.pointerEvents = "auto";
				failBtn.style.pointerEvents = "auto";
				successBtn.style.opacity = "1";
				failBtn.style.opacity = "1";
		}
		
		function resetSession() {
				currentPuzzleIndex = 0;
				totalTime = 0;
				puzzleTimes = [];

				localStorage.removeItem("currentPuzzleIndex");
				localStorage.removeItem("totalTime");
				localStorage.removeItem("puzzleTimes");

				document.getElementById("puzzleHistory").innerHTML = "";
				document.getElementById("totalTime").textContent = formatTime(0);
		}

    async function fetchPuzzles() {
        try {
            const response = await fetch(apiUrl);
            puzzles = await response.json();
            if (puzzles.length === 0) {
                console.error("No puzzles found");
                return;
            }
            // Initialize session if puzzles are loaded
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

        // Save progress
        localStorage.setItem("currentPuzzleIndex", currentPuzzleIndex);
        localStorage.setItem("totalTime", totalTime);
        localStorage.setItem("puzzleTimes", JSON.stringify(puzzleTimes));

        updatePuzzleHistory();

        // Check if all puzzles have been completed
        if (currentPuzzleIndex >= puzzles.length) {
            stopStopwatch();
            document.getElementById("successButton").style.display = 'none';
            document.getElementById("failButton").style.display = 'none';
            document.getElementById("stopPuzzle").style.display = 'none';
            alert("You've completed all puzzles!");
        }
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
        // If user has completed all 100 puzzles, reset session data
        if (currentPuzzleIndex  >= 100) {
            console.log("Resetting session - All 100 puzzles completed.");
						resetSession(); // Clears session history if 100 puzzles are done
        }

				startStopwatch();
				loadPuzzle();
				
				localStorage.setItem("currentPuzzleIndex", currentPuzzleIndex);
				localStorage.setItem("totalTime", totalTime);
				localStorage.setItem("puzzleTimes", JSON.stringify(puzzleTimes));

				document.getElementById("startPuzzle").style.display = 'none'; 
				document.getElementById("stopPuzzle").style.display = 'inline'; 
    });

    document.getElementById("stopPuzzle").addEventListener("click", function () {
        stopStopwatch();
        localStorage.removeItem("currentPuzzleIndex");
        localStorage.removeItem("totalTime");
        localStorage.removeItem("puzzleTimes");

        document.getElementById("stopPuzzle").style.display = 'none';
        document.getElementById("startPuzzle").style.display = 'inline';
        document.getElementById("successButton").style.display = 'none';
        document.getElementById("failButton").style.display = 'none';
    });

		document.getElementById("successButton").addEventListener("click", function () {
				if (currentPuzzleIndex >= 100) {
						alert("You have completed all puzzles! Restarting the session will clear history.");
						return;
				}

				disablePuzzleButtons();

				const timeTaken = Math.floor((Date.now() - puzzleStartTime) / 1000);
				document.getElementById("puzzleDetails").textContent = `You completed the puzzle in ${timeTaken} seconds. Category: ${category}`;
				
				logPuzzleTime(true);
				currentPuzzleIndex++;

				setTimeout(() => {
						loadPuzzle();
						enablePuzzleButtons();
				}, 2000);
		});

		document.getElementById("failButton").addEventListener("click", function () {
				if (currentPuzzleIndex >= 100) {
						alert("You have completed all puzzles! Restarting the session will clear history.");
						return;
				}

				disablePuzzleButtons();

				const timeTaken = Math.floor((Date.now() - puzzleStartTime) / 1000);
				document.getElementById("puzzleDetails").textContent = `You failed the puzzle in ${timeTaken} seconds. Category: ${category}`;
				
				logPuzzleTime(false);
				currentPuzzleIndex++;

				setTimeout(() => {
						loadPuzzle();
						enablePuzzleButtons();
				}, 2000);
		});

    // Ensure Success and Fail buttons are hidden initially
    document.getElementById("successButton").style.display = 'none';
    document.getElementById("failButton").style.display = 'none';

    fetchPuzzles();
});