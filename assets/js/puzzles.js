import { Chessground } from "https://cdnjs.cloudflare.com/ajax/libs/chessground/9.1.1/chessground.min.js";
import { Chess } from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js";
import { soundManager } from './sounds.js';
import { MoveHandler, MOVE_DELAY } from './moves.js';

document.addEventListener("DOMContentLoaded", async function () {

    // declare vars
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
    let hintUsed = false;
    let category;
    let moveHandler;
    let sessionStats = {
        totalPuzzles: 0,
        correctPuzzles: 0,
        categoryStats: {},
        failedPuzzles: []
    };

    const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8081'
        : 'https://chesswoodpecker-production.up.railway.app';
    const apiUrl = `${baseUrl}/api/puzzles`;

    const { supabaseClient } = window.auth;

    const { data: { session } } = await supabaseClient.auth.getSession();
    updateAuthUI(session);

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        updateAuthUI(session);

        if (session && event === 'SIGNED_IN') {
            await initializePuzzles();
        }
    });

    const hintButton = document.getElementById('hintButton');
    const puzzleHint = document.getElementById('puzzleHint');
    const puzzleCategory = document.getElementById('puzzleCategory');
    const BOARD_ELEMENT = document.getElementById("chessboard");

    // Start puzzle listener with error handling
    document.getElementById("startPuzzle").addEventListener("click", async function () {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                alert('Please sign in to start a session');
                return;
            }

            if (!dbPuzzles || dbPuzzles.length === 0) {
                await fetchPuzzles();
            }

            startStopwatch();
            await loadPuzzle();
            toggleSessionButtons(true);
        } catch (error) {
            console.error('Error starting puzzle session:', error);
        }
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

    async function initializePuzzles() {
        try {
            await fetchPuzzles();
            if (dbPuzzles && dbPuzzles.length > 0) {
                document.getElementById("startPuzzle").style.display = 'inline';
            } else {
                console.error('No puzzles available');
            }
        } catch (error) {
            console.error('Error initializing puzzles:', error);
        }
    }

    // Update states
    function updateAuthUI(session) {
        const googleSignInInfo = document.getElementById('googleSignInInfo');
        const authContainer = document.getElementById('authContainer');
        const puzzleContainer = document.getElementById('puzzle-container');

        if (session) {
            googleSignInInfo.style.display = 'none';

            // Authenticated state
            authContainer.innerHTML = `
                <div class="alert alert-success">
                    Signed in as: ${session.user.email}
                    <button onclick="window.auth.signOut()" class="btn btn-outline-danger btn-sm ms-3">
                        Sign Out
                    </button>
                </div>`;
            puzzleContainer.style.display = 'block';
        } else {
            // Show the Google Sign-In info when not authenticated
            googleSignInInfo.style.display = 'block';

            // Not authenticated
            authContainer.innerHTML = `
                <div class="alert alert-warning">
                    Please sign in to access puzzles
                    <button onclick="window.auth.signInWithGoogle()" class="btn btn-primary ms-3">
                        Sign in with Google
                    </button>
                </div>`;
            puzzleContainer.style.display = 'none';
        }
    }

    function toggleSessionButtons(isStarting) {
        document.getElementById("startPuzzle").style.display = isStarting ? 'none' : 'inline';
        document.getElementById("stopPuzzle").style.display = isStarting ? 'inline' : 'none';
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            dbPuzzles = await response.json();

            if (dbPuzzles.length === 0) {
                console.error('No puzzles available in response');
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error fetching puzzles from our database:", error);
            return false;
        }
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
        if (!dbPuzzles || dbPuzzles.length === 0) {
            console.error('No puzzles loaded');
            return;
        }

        if (currentPuzzleIndex >= dbPuzzles.length) {
            currentPuzzleIndex = 0;
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
            console.error('Error loading puzzle:', error);
            currentPuzzleIndex++;
            await loadPuzzle();
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
        if (moveHandler) {
            moveHandler.stopAutoSolve();
        }
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
                dests: new Map()  // Start with empty moves
            },
            highlight: {
                lastMove: true,
                check: true
            }
        });

        // Initialize moveHandler first
        moveHandler = new MoveHandler(game, board);

        // Now update the board with proper move destinations
        board.set({
            movable: {
                free: false,
                color: isWhiteTurn ? 'white' : 'black',
                dests: moveHandler.getLegalMoves(),
                events: {
                    after: (orig, dest) => {
                        moveHandler.onMove(orig, dest, currentPuzzleData, {
                            onSuccess: onPuzzleComplete,
                            onFailure: onPuzzleFailure,
                        });
                    }
                }
            }
        });
    }

    function logPuzzleCompletion(success) {
        const elapsedTime = Date.now() - puzzleStartTime;
        const formattedTime = formatElapsedTime(elapsedTime);

        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];
        const category = puzzleMetadata ? puzzleMetadata.category : "Unknown";
        const puzzleLink = puzzleMetadata ? `https://lichess.org/training/${puzzleMetadata.lichess_id}` : "#";

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
        soundManager.playResultSound(true);
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
        moveHandler.resetAndSolvePuzzle(currentPuzzleData, {
            onComplete: loadNextPuzzle,
            onUpdateDisplay: updateTurnDisplay
        });
    }

    function loadNextPuzzle() {
        currentPuzzleIndex++;
        loadPuzzle();
    }
});
