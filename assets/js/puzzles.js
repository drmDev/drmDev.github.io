import { Chessground } from "https://cdnjs.cloudflare.com/ajax/libs/chessground/9.1.1/chessground.min.js";
import { Chess } from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js";

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

    const BOARD_ELEMENT = document.getElementById("chessboard");

    const MOVE_DELAY = 2000;

    document.getElementById("startPuzzle").addEventListener("click", function () {
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

        game = new Chess(); // Reset game to initial position
        const pgnMoves = currentPuzzleData.game.pgn.split(" ").filter(m => !/\d+\./.test(m));
        const initialPly = currentPuzzleData.puzzle.initialPly;

        for (let i = 0; i < initialPly + 1; i++) {
            game.move(pgnMoves[i], {
                sloppy: true
            });
        }

        // during the reset, do not allow the user to move the pieces
        updateBoardState(game.fen(), [], false);

        currentSolutionIndex = 0;

        updateTurnDisplay(true); // Update turn display to "Loading next puzzle"
        playSolutionAutomatically(() => {
            setTimeout(loadNextPuzzle, 2000);
        });
    }

    function playSolutionAutomatically(onComplete) {

        if (currentSolutionIndex >= currentPuzzleData.solutionSAN.length) {
            autoSolveTimeout = setTimeout(() => {
                if (onComplete)
                    onComplete();
            }, 2000);
            return;
        }

        const nextMoveSAN = currentPuzzleData.solutionSAN[currentSolutionIndex];
        const move = game.move(nextMoveSAN);
        if (!move) {
            return;
        }

        updateBoardState(game.fen(), [move.from, move.to], false);

        currentSolutionIndex++;
        autoSolveTimeout = setTimeout(() => playSolutionAutomatically(onComplete), 2000);
    }

    async function convertUCIToSAN(uciMoves, initialFEN) {
        // Create a temporary chess game instance with the given position
        const tempGame = new Chess(initialFEN);

        // Convert each UCI move to SAN notation
        const sanMoves = uciMoves.map(uci => {
            // UCI format example: "e2e4" or "e7e8q" (for promotion)
            // slice(0,2) gets the 'from' square (e.g., "e2")
            // slice(2,4) gets the 'to' square (e.g., "e4")
            // uci[4] gets the promotion piece if it exists (e.g., "q" for queen)
            const move = tempGame.move({
                from: uci.slice(0, 2),
                to: uci.slice(2, 4),
                promotion: uci[4] || undefined
            }, {
                sloppy: true // Allows more flexible move parsing
            });

            return move ? move.san : null; // Remove any null moves that failed to convert
        }).filter(m => m);

        return sanMoves;
    }

    async function loadPuzzle() {
        if (currentPuzzleIndex >= dbPuzzles.length) {
            currentPuzzleIndex = 0;
            return;
        }

        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];

        try {
            currentPuzzleData = await fetchPuzzleData(puzzleMetadata.lichess_id);
            initializePuzzleState();
            await setupGamePosition();
            initializeChessboard();
            updateTurnDisplay();

            console.log("✅ Puzzle loaded successfully", {
                isWhiteTurn: game.turn() === 'w',
                solution: currentPuzzleData.solutionSAN,
                fen: game.fen()
            });
        } catch (error) {
            currentPuzzleIndex++;
            loadPuzzle();
        }
    }

    async function fetchPuzzleData(lichessId) {
        const response = await fetch(`https://lichess.org/api/puzzle/${lichessId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    function initializePuzzleState() {
        puzzleStartTime = Date.now();
        document.getElementById("puzzleTitle").textContent = `Puzzle ${currentPuzzleIndex + 1}`;
        currentSolutionIndex = 0;
        stopAutoSolve();
    }

    async function setupGamePosition() {
        const pgnMoves = currentPuzzleData.game.pgn.split(' ').filter(m => !/\d+\./.test(m));
        const initialPly = currentPuzzleData.puzzle.initialPly;

        game = new Chess();

        for (let i = 0; i < initialPly + 1; i++) {
            game.move(pgnMoves[i], { sloppy: true });
        }

        currentPuzzleData.solutionSAN = await convertUCIToSAN(
            currentPuzzleData.puzzle.solution,
            game.fen()
        );
    }

    function initializeChessboard() {
        const isWhiteTurn = game.turn() === 'w';

        board = Chessground(BOARD_ELEMENT, {
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
                lastMove: true,
                check: true
            }
        });
    }

    function getLegalMoves(chess) {
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

        const puzzleNumber = currentPuzzleIndex + 1;
        const statusElement = success ?
            '<span class="status-icon success">✔️</span>' :
            '<span class="status-icon failure">❌</span>';

        const historyEntry = `
        <li>
            <b>Puzzle ${puzzleNumber}</b>
            <span class="elapsed-time ${success ? 'success' : 'failure'}">${formattedTime}</span> 
            ${statusElement}
            <i class="category">${category}</i> 
            <a href="${puzzleLink}" target="_blank">View Puzzle</a>
        </li>`;
        document.getElementById("puzzleHistory").innerHTML += historyEntry;

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
            turnIndicator.textContent = '... Loading next puzzle ...';
            turnIndicator.className = 'turn-display loading';
        } else {
            const turnColor = game.turn() === 'w' ? 'White' : 'Black';
            turnIndicator.textContent = `${turnColor} to move`;
            turnIndicator.className = `turn-display ${turnColor.toLowerCase()}-turn`;
        }
    }

    function onPuzzleComplete() {
        logPuzzleCompletion(true);
        updateTurnDisplay(true);
        setTimeout(loadNextPuzzle, 2000);
    }

    function onPuzzleFailure() {
        logPuzzleCompletion(false);
        resetAndSolvePuzzle();
    }

    function loadNextPuzzle() {

        currentPuzzleIndex++;
        loadPuzzle();
    }

    function onMove(orig, dest) {

        const move = game.move({
            from: orig,
            to: dest,
            promotion: "q"
        });

        if (!move) {
            return;
        }

        const expectedMove = currentPuzzleData.solutionSAN[currentSolutionIndex];

        if (move.san !== expectedMove) {
            const failMessage = document.getElementById("failMessage");
            failMessage.style.display = "block";
            
            setTimeout(() => {
                    failMessage.style.display = "none";
                    onPuzzleFailure();
            }, 2000);
            
            return;
        }

        updateBoardState(game.fen(), [orig, dest]);
        currentSolutionIndex++;

        if (currentSolutionIndex >= currentPuzzleData.solutionSAN.length) {
            onPuzzleComplete();
        } else {
            setTimeout(aiMove, 500);
        }
    }

    function aiMove() {
        if (!currentPuzzleData || currentSolutionIndex >= currentPuzzleData.solutionSAN.length) {            
            return;
        }

        const nextMoveSAN = currentPuzzleData.solutionSAN[currentSolutionIndex];
        const move = game.move(nextMoveSAN);

        if (!move) {
            return;
        }

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
