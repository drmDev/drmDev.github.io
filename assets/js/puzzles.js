import {
    Chessground
}
from "https://cdnjs.cloudflare.com/ajax/libs/chessground/9.1.1/chessground.min.js";
import {
    Chess
}
from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js";

document.addEventListener("DOMContentLoaded", async function () {
    const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
     ? 'http://localhost:8081'
     : 'https://chesswoodpecker-production.up.railway.app';
    const apiUrl = `${baseUrl}/api/puzzles`;

    let currentPuzzleIndex = 0;
    let gameStartTime = 0;
    let totalTime = 0;
    let puzzleStartTime;
    let puzzleTimes = [];
    let game;
    let board;
    let stopwatchInterval;
    let dbPuzzles = [];
    let currentPuzzleData = null;
    let currentSolutionIndex = 0;
    let autoSolveTimeout = null;

    const boardElement = document.getElementById("chessboard");

    // Add this to track when the session starts
    document.getElementById("startPuzzle").addEventListener("click", function () {
        console.log("🎮 Starting new puzzle session");
        startStopwatch();
        loadPuzzle();
        toggleSessionButtons(true);
    });
    document.getElementById("stopPuzzle").addEventListener("click", function () {
        stopStopwatch();
        toggleSessionButtons(false);
    });

    function toggleSessionButtons(isStarting) {
        document.getElementById("startPuzzle").style.display = isStarting ? 'none' : 'inline';
        document.getElementById("stopPuzzle").style.display = isStarting ? 'inline' : 'none';
    }

    function updateBoardState(fen, lastMove = null, allowMoves = true) {
        const isWhiteTurn = game.turn() === 'w';
        const boardConfig = {
            fen: fen,
            turnColor: isWhiteTurn ? 'white' : 'black',
            movable: {
                color: allowMoves ? (isWhiteTurn ? 'white' : 'black') : null,
                dests: allowMoves ? getLegalMoves(game) : null
            }
        };

        if (lastMove) {
            boardConfig.lastMove = lastMove;
        }

        board.set(boardConfig);
    }

    async function fetchPuzzles() {
        try {
            const response = await fetch(apiUrl);
            dbPuzzles = await response.json();
            if (dbPuzzles.length === 0) {
                return;
            }
            document.getElementById("startPuzzle").style.display = 'inline';
        } catch (error) {
            console.error("Error fetching puzzles from our database:", error);
        }
    }

    function formatElapsedTime(ms) {
        return dayjs(ms).format('mm:ss.SSS');
    }

    function startStopwatch() {
        gameStartTime = Date.now() - totalTime;
        stopwatchInterval = setInterval(() => {
            totalTime = Date.now() - gameStartTime;
            document.getElementById("totalTime").textContent = formatElapsedTime(totalTime);
        }, 10);
    }

    function stopStopwatch() {
        clearInterval(stopwatchInterval);
    }

    function resetAndSolvePuzzle() {
        console.log("🎯 resetAndSolvePuzzle started", {
            currentSolutionIndex,
            currentPuzzleIndex
        });

        // Reset game to initial position
        game = new Chess();
        const pgnMoves = currentPuzzleData.game.pgn.split(" ").filter(m => !/\d+\./.test(m));
        const initialPly = currentPuzzleData.puzzle.initialPly;

        for (let i = 0; i < initialPly + 1; i++) {
            game.move(pgnMoves[i], {
                sloppy: true
            });
        }

        board.set({
            fen: game.fen(),
            lastMove: [],
            turnColor: game.turn() === 'w' ? 'white' : 'black',
            movable: {
                color: null
            } // Prevent user moves during replay
        });

        currentSolutionIndex = 0;
        console.log("🎮 Board reset complete, starting auto-solve sequence");

        // Ensure next puzzle doesn't load until auto-solve is done
        updateTurnDisplay(true); // Update turn display to "Loading next puzzle"
        playSolutionAutomatically(() => {
            console.log("⏭️ Auto-solve complete. Now loading next puzzle.");
            setTimeout(loadNextPuzzle, 2000);
        });
    }

    function playSolutionAutomatically(onComplete) {
        console.log("🎬 playSolutionAutomatically", {
            currentSolutionIndex,
            totalMoves: currentPuzzleData.solutionSAN.length
        });

        if (currentSolutionIndex >= currentPuzzleData.solutionSAN.length) {
            console.log("✅ Solution playback complete");
            autoSolveTimeout = setTimeout(() => {
                if (onComplete)
                    onComplete();
            }, 2000);
            return;
        }

        const nextMoveSAN = currentPuzzleData.solutionSAN[currentSolutionIndex];
        const move = game.move(nextMoveSAN);
        if (!move) {
            console.error("❌ Failed to make move:", nextMoveSAN);
            return;
        }

        updateBoardState(game.fen(), [move.from, move.to], false);

        currentSolutionIndex++;

        // Store timeout ID so we can clear it if needed
        autoSolveTimeout = setTimeout(() => playSolutionAutomatically(onComplete), 2000);
    }

    async function convertUCIToSAN(uciMoves, initialFEN) {
        const tempGame = new Chess(initialFEN);
        const sanMoves = uciMoves.map(uci => {
            const move = tempGame.move({
                from: uci.slice(0, 2),
                to: uci.slice(2, 4),
                promotion: uci[4] || undefined
            }, {
                sloppy: true
            });

            return move ? move.san : null;
        }).filter(m => m);

        return sanMoves;
    }

    async function loadPuzzle() {
        console.log(`🎯 Loading puzzle ${currentPuzzleIndex + 1}`, {
            currentSolutionIndex,
            autoSolveTimeout
        });

        if (currentPuzzleIndex >= dbPuzzles.length) {
            currentPuzzleIndex = 0; // Reset to first puzzle
            return;
        }

        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];

        try {
            const response = await fetch(`https://lichess.org/api/puzzle/${puzzleMetadata.lichess_id}`);
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            currentPuzzleData = await response.json();

            puzzleStartTime = Date.now();
            document.getElementById("puzzleTitle").textContent = `Puzzle ${currentPuzzleIndex + 1}`;

            currentSolutionIndex = 0;
            stopAutoSolve(); // Ensure any previous timeouts are cleared

            const pgnMoves = currentPuzzleData.game.pgn.split(' ').filter(m => !/\d+\./.test(m));
            const initialPly = currentPuzzleData.puzzle.initialPly;

            game = new Chess();

            for (let i = 0; i < initialPly + 1; i++) {
                game.move(pgnMoves[i], {
                    sloppy: true
                });
            }

            currentPuzzleData.solutionSAN = await convertUCIToSAN(
                    currentPuzzleData.puzzle.solution,
                    game.fen());

            const isWhiteTurn = game.turn() === 'w';

            board = Chessground(boardElement, {
                fen: game.fen(),
                orientation: isWhiteTurn ? 'white' : 'black',
                turnColor: isWhiteTurn ? 'white' : 'black',
                movable: {
                    free: false,
                    color: isWhiteTurn ? 'white' : 'black',
                    dests: getLegalMoves(game),
                    events: {
                        after: (orig, dest) => {
                            onMove(orig, dest);
                        }
                    }
                },
                highlight: {
                    lastMove: true, // Keep last move highlighted as per request
                    check: true
                }
            });

            updateTurnDisplay();
            console.log("✅ Puzzle loaded successfully", {
                isWhiteTurn: game.turn() === 'w',
                solution: currentPuzzleData.solutionSAN,
                fen: game.fen()
            });
        } catch (error) {
            console.error("❌ Failed to load puzzle:", error);
            currentPuzzleIndex++;
            loadPuzzle(); // Try the next puzzle if error occurs
        }
    }

    function getLegalMoves(chess) {
        const SQUARES = [
            'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
            'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
            'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
            'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
            'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
            'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
            'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
            'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
        ];
        const dests = new Map();
        const currentTurn = chess.turn();

        SQUARES.forEach(square => {
            const piece = chess.get(square);
            if (piece && piece.color === currentTurn) {
                const moves = chess.moves({
                    square,
                    verbose: true,
                    color: currentTurn
                });
                if (moves.length) {
                    dests.set(square, moves.map(m => m.to));
                }
            }
        });
        return dests;
    }

    function logPuzzleCompletion(success) {
        const elapsedTime = Date.now() - puzzleStartTime;
        const formattedTime = formatElapsedTime(elapsedTime);

        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];
        const category = puzzleMetadata ? puzzleMetadata.category : "Unknown";
        const puzzleLink = puzzleMetadata ?
`https://lichess.org/training/${puzzleMetadata.lichess_id}` : "#";

        const puzzleNumber = currentPuzzleIndex + 1; // Directly use currentPuzzleIndex + 1
        const statusIcon = success ?
            '<span class="status-icon" style="color:green;">✔️</span>' :
            '<span class="status-icon" style="color:red;">❌</span>';

        const statusClass = success ? 'success-time' : 'failure-time'; // Apply class for success or failure

        const historyEntry = `
    <li>
        <b>Puzzle ${puzzleNumber}</b>
        <span class="elapsed-time ${statusClass}">${formattedTime}</span> 
        ${statusIcon}
        <i class="category">${category} </i> 
        <a href="${puzzleLink}" target="_blank">View Puzzle</a>
    </li>`;
        document.getElementById("puzzleHistory").innerHTML += historyEntry;

        puzzleTimes.push({
            number: puzzleNumber,
            time: formattedTime,
            success,
            category
        });

        puzzleTimes.push({
            number: puzzleNumber,
            time: formattedTime,
            success,
            category
        });
    }

    function updateTurnDisplay(isPuzzleComplete = false) {
        const turnIndicator = document.getElementById('turnIndicator');

        if (isPuzzleComplete) {
            turnIndicator.textContent = '... Loading next puzzle ...'; // Change text when the puzzle is complete
            turnIndicator.className = 'turn-display loading'; // Optional: Add a custom class for styling
        } else {
            const turnColor = game.turn() === 'w' ? 'White' : 'Black';
            turnIndicator.textContent = `${turnColor} to move`;
            turnIndicator.className = `turn-display ${turnColor.toLowerCase()}-turn`;
        }
    }

    function onPuzzleComplete() {
        logPuzzleCompletion(true); // Log puzzle completion (Success)
        updateTurnDisplay(true); // Update the turn display to indicate loading of the next puzzle
        setTimeout(loadNextPuzzle, 2000); // Delay before loading the next one
    }

    function onPuzzleFailure() {
        logPuzzleCompletion(false); // Failure
        resetAndSolvePuzzle();
    }

    function loadNextPuzzle() {
        console.log("⏭️ Loading next puzzle", {
            currentPuzzleIndex,
            currentSolutionIndex
        });

        currentPuzzleIndex++;
        loadPuzzle();
    }

    function onMove(orig, dest) {
        console.log("👉 User attempted move", {
            orig,
            dest,
            currentSolutionIndex,
            expectedMove: currentPuzzleData.solutionSAN[currentSolutionIndex]
        });

        const move = game.move({
            from: orig,
            to: dest,
            promotion: "q"
        });

        if (!move) {
            console.log("❌ Invalid move attempted");
            return;
        }

        const expectedMove = currentPuzzleData.solutionSAN[currentSolutionIndex];

        if (move.san !== expectedMove) {
            document.getElementById("failMessage").style.display = "block";
            document.getElementById("failMessage").textContent = "Incorrect move! Watch the correct solution.";

            setTimeout(() => {
                document.getElementById("failMessage").style.display = "none";
                onPuzzleFailure(); // Log the failure and replay the solution
            }, 2000);

            return;
        }

        // Update board after player's move
        updateBoardState(game.fen(), [orig, dest]);
        currentSolutionIndex++;

        if (currentSolutionIndex >= currentPuzzleData.solutionSAN.length) {
            console.log("🎉 Puzzle completed successfully");
            onPuzzleComplete(); // Puzzle is complete
        } else {
            // Make opponent's move after a short delay
            console.log("🤖 Waiting to make AI move...");
            setTimeout(aiMove, 500);
        }
    }

    function aiMove() {
        console.log("🤖 AI making move", {
            currentSolutionIndex,
            totalMoves: currentPuzzleData.solutionSAN.length
        });

        if (!currentPuzzleData || currentSolutionIndex >= currentPuzzleData.solutionSAN.length) {
            console.log("⚠️ AI move attempted but puzzle is complete");
            return;
        }

        const nextMoveSAN = currentPuzzleData.solutionSAN[currentSolutionIndex];
        const move = game.move(nextMoveSAN);

        if (!move) {
            console.error("❌ AI failed to make move:", nextMoveSAN);
            return;
        }

        console.log("✅ AI move complete", {
            move: nextMoveSAN,
            newFen: game.fen()
        });

        updateBoardState(game.fen(), [move.from, move.to]);
        currentSolutionIndex++;
    }

    function stopAutoSolve() {
        if (autoSolveTimeout) {
            clearTimeout(autoSolveTimeout);
            autoSolveTimeout = null;
        }
    }

    await fetchPuzzles();
});
