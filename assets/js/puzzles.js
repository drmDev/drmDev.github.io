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
    let isSoundEnabled = true;
    let hintUsed = false;
    let category;
    let sessionStats = {
        totalPuzzles: 0,
        correctPuzzles: 0,
        categoryStats: {},
        failedPuzzles: []
    };

    const moveSound = document.getElementById('moveSound');
    const captureSound = document.getElementById('captureSound');
    const checkSound = document.getElementById('checkSound');
    const toggleSoundBtn = document.getElementById('toggleSound');
    const hintButton = document.getElementById('hintButton');
    const puzzleHint = document.getElementById('puzzleHint');
    const puzzleCategory = document.getElementById('puzzleCategory');

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

    // Event Listeners
    document.getElementById("startPuzzle").addEventListener("click", function () {
        startStopwatch();
        loadPuzzle();
        toggleSessionButtons(true);
    });
    document.getElementById("stopPuzzle").addEventListener("click", function () {
        stopStopwatch();
        toggleSessionButtons(false);
        hintButton.style.display = 'none';
        showSessionSummary();
    });
    hintButton.addEventListener('click', function () {
        if (!currentPuzzleData || hintUsed) return;

        category = dbPuzzles[currentPuzzleIndex].category;
        puzzleCategory.textContent = category;
        puzzleHint.style.display = 'inline';

        hintButton.disabled = true;
        hintUsed = true;
    });

    // Sounds
    initializeSoundControls();

    function initializeSoundControls() {
        if (!toggleSoundBtn) return;

        isSoundEnabled = localStorage.getItem('chessSoundEnabled') !== 'false';
        updateSoundIcon();

        toggleSoundBtn.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            localStorage.setItem('chessSoundEnabled', isSoundEnabled);
            updateSoundIcon();
        });
    }

    function updateSoundIcon() {
        if (!toggleSoundBtn) return;

        const iconClass = isSoundEnabled ? 'fa-volume-up' : 'fa-volume-mute';
        const buttonText = isSoundEnabled ? 'Sound On' : 'Sound Off';
        const buttonClass = isSoundEnabled ? 'btn-success' : 'btn-secondary';

        toggleSoundBtn.innerHTML = `<i class="fas ${iconClass}"></i> ${buttonText}`;
        toggleSoundBtn.className = `btn puzzle-btn ms-2 ${buttonClass}`;
    }

    function playChessSound(move, position) {
        if (!isSoundEnabled || !moveSound || !captureSound || !checkSound) return;

        if (position.in_check()) {
            checkSound.currentTime = 0;
            checkSound.play();
        } else if (move.captured) {
            captureSound.currentTime = 0;
            captureSound.play();
        } else {
            moveSound.currentTime = 0;
            moveSound.play();
        }
    }

    // Update states
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

    // Time formatting
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

    // Session Summary Reports
    function showSessionSummary() {
        // Calculate overall stats
        const successRate = (sessionStats.correctPuzzles / sessionStats.totalPuzzles * 100).toFixed(1);
        const overallStatsHtml = `
            <div class="alert alert-info">
                <strong>Puzzles Completed:</strong> ${sessionStats.correctPuzzles}/${sessionStats.totalPuzzles} (${successRate}%)
            </div>
        `;
        document.getElementById('overallStats').innerHTML = overallStatsHtml;

        // Calculate category stats
        let categoryStatsHtml = '';
        for (const category in sessionStats.categoryStats) {
            const stats = sessionStats.categoryStats[category];
            const categoryRate = (stats.correct / stats.total * 100).toFixed(1);
            categoryStatsHtml += `
                <div class="category-stat">
                    <span>${category}</span>
                    <span>${stats.correct}/${stats.total} (${categoryRate}%)</span>
                </div>
            `;
        }
        document.getElementById('categoryStats').innerHTML = categoryStatsHtml || '<p>No category data available</p>';

        // Display failed puzzles
        let failedPuzzlesHtml = '';
        if (sessionStats.failedPuzzles.length > 0) {
            failedPuzzlesHtml = sessionStats.failedPuzzles.map(puzzle => `
                <a href="${puzzle.url}" class="failed-puzzle-link" target="_blank">
                    <i class="fas fa-external-link-alt"></i> ${puzzle.category} Puzzle #${puzzle.id}
                </a>
            `).join('');
        } else {
            failedPuzzlesHtml = '<p class="text-success">No failed puzzles! Great job!</p>';
        }
        document.getElementById('failedPuzzles').innerHTML = failedPuzzlesHtml;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('sessionSummaryModal'));
        modal.show();
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
            setTimeout(loadNextPuzzle, MOVE_DELAY);
        });
    }

    function playSolutionAutomatically(onComplete) {

        if (currentSolutionIndex >= currentPuzzleData.solutionSAN.length) {
            autoSolveTimeout = setTimeout(() => {
                if (onComplete)
                    onComplete();
            }, MOVE_DELAY);
            return;
        }

        const nextMoveSAN = currentPuzzleData.solutionSAN[currentSolutionIndex];
        const move = game.move(nextMoveSAN);
        if (!move) {
            return;
        }
        playChessSound(move, game);

        updateBoardState(game.fen(), [move.from, move.to], false);

        currentSolutionIndex++;
        autoSolveTimeout = setTimeout(() => playSolutionAutomatically(onComplete), MOVE_DELAY);
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

    // Load each puzzle
    async function loadPuzzle() {
        if (currentPuzzleIndex >= dbPuzzles.length) {
            currentPuzzleIndex = 0;
            return;
        }

        // Reset hint state
        hintButton.style.display = 'inline-flex';
        hintButton.disabled = false;
        hintUsed = false;
        puzzleHint.style.display = 'none';

        document.getElementById("puzzleTitle").textContent = `Puzzle ${currentPuzzleIndex + 1}`;

        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];
        sessionStats.totalPuzzles++;
        // Initialize category stats if needed
        if (!sessionStats.categoryStats[puzzleMetadata.category]) {
            sessionStats.categoryStats[puzzleMetadata.category] = {
                total: 0,
                correct: 0
            };
        }
        sessionStats.categoryStats[puzzleMetadata.category].total++;

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
        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];
        sessionStats.correctPuzzles++;
        sessionStats.categoryStats[puzzleMetadata.category].correct++;

        logPuzzleCompletion(true);
        updateTurnDisplay(true);
        setTimeout(loadNextPuzzle, MOVE_DELAY);
    }

    function onPuzzleFailure() {
        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];
        sessionStats.failedPuzzles.push({
            id: puzzleMetadata.puzzle_id,
            category: puzzleMetadata.category,
            url: puzzleMetadata.url
        });

        hintButton.style.display = 'none';
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

        playChessSound(move, game);

        const expectedMove = currentPuzzleData.solutionSAN[currentSolutionIndex];

        if (move.san !== expectedMove) {
            const failMessage = document.getElementById("failMessage");
            failMessage.style.display = "block";
            
            setTimeout(() => {
                    failMessage.style.display = "none";
                    onPuzzleFailure();
            }, MOVE_DELAY);
            
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

        playChessSound(move, game);

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
