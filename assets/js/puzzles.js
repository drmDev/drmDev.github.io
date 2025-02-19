import { Chessground } from "https://cdnjs.cloudflare.com/ajax/libs/chessground/9.1.1/chessground.min.js";
import { Chess } from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js";
import { soundManager } from './sounds.js';
import { MoveHandler, MOVE_DELAY } from './moves.js';
import { SessionStats } from './stats.js';
import { TimerManager } from './timer.js';
import { UIManager } from './ui.js';

document.addEventListener("DOMContentLoaded", async function () {
    let currentPuzzleIndex = 0;
    let puzzleStartTime;
    let game;
    let board;
    let dbPuzzles = [];
    let currentPuzzleData = null;
    let hintUsed = false;
    let category;
    let moveHandler;
    let puzzleTimes = [];
    const sessionStats = new SessionStats();
    const timerManager = new TimerManager();
    const uiManager = new UIManager();

    const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8081'
        : 'https://chesswoodpecker-production.up.railway.app';
    const apiUrl = `${baseUrl}/api/puzzles`;

    const BOARD_ELEMENT = document.getElementById("chessboard");

    document.getElementById('puzzle-container').style.display = 'block';
    uiManager.toggleSessionButtons(false);

    try {
        await fetchPuzzles();
        if (dbPuzzles && dbPuzzles.length > 0) {
            console.log('Puzzles loaded successfully');
        } else {
            console.error('No puzzles available');
        }
    } catch (error) {
        console.error('Error loading initial puzzles:', error);
    }

    document.getElementById("startPuzzle").addEventListener("click", async function () {
        try {
            if (!dbPuzzles || dbPuzzles.length === 0) {
                await fetchPuzzles();
            }

            // console.log('Starting new puzzle session');
            uiManager.toggleSessionButtons(true);
            timerManager.start();
            await loadPuzzle();
        } catch (error) {
            console.error('Error starting puzzle session:', error);
            uiManager.toggleSessionButtons(false);
        }
    });

    document.getElementById("stopPuzzle").addEventListener("click", function () {
        // console.log('Stopping puzzle session');
        timerManager.stop();
        uiManager.toggleSessionButtons(false);
        uiManager.hideHintButton();
        uiManager.showSessionSummary(sessionStats, {
            onNewSession: async () => {
                // console.log('Starting new session from summary');
                resetSession();
                await loadPuzzle();
                timerManager.start();
                uiManager.toggleSessionButtons(true);
            }
        });
    });

    hintButton.addEventListener('click', function () {
        if (!currentPuzzleData || hintUsed) return;

        category = dbPuzzles[currentPuzzleIndex].category;
        uiManager.showHint(category);
        hintUsed = true;
    });

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

    async function loadPuzzle() {
        if (!dbPuzzles || dbPuzzles.length === 0) {
            console.error('No puzzles loaded');
            return;
        }

        // auto stop the session when all 100 puzzles are done
        if (currentPuzzleIndex >= dbPuzzles.length) {
            timerManager.stop();
            uiManager.hideHintButton();
            uiManager.showSessionSummary(sessionStats, {
                onNewSession: async () => {
                    resetSession();
                    await loadPuzzle();
                    timerManager.start();
                }
            });
            return;
        }

        uiManager.resetHint();
        hintUsed = false;
        uiManager.setPuzzleTitle(currentPuzzleIndex + 1);
        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];

        try {
            currentPuzzleData = await fetchPuzzleData(puzzleMetadata.lichess_id);
            initializePuzzleState();
            await setupGamePosition();
            initializeChessboard();
            uiManager.updateTurnDisplay(game);

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

    function resetSession() {
        // console.log('Resetting session state');
        currentPuzzleIndex = 0;
        currentPuzzleData = null;
        hintUsed = false;
        puzzleTimes.length = 0;
        sessionStats.reset();
        timerManager.reset();
        uiManager.resetUI();
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
        uiManager.setPuzzleTitle(currentPuzzleIndex + 1);
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

    function onPuzzleComplete() {
        soundManager.playResultSound(true);
        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];
        sessionStats.recordPuzzleAttempt(puzzleMetadata, true);

        uiManager.logPuzzleCompletion(
            puzzleMetadata,
            currentPuzzleIndex,
            true,
            timerManager,
            puzzleStartTime
        );

        uiManager.updateTurnDisplay(game, true);
        setTimeout(loadNextPuzzle, MOVE_DELAY);
    }

    function onPuzzleFailure() {
        const puzzleMetadata = dbPuzzles[currentPuzzleIndex];
        sessionStats.recordPuzzleAttempt(puzzleMetadata, false);
        uiManager.hideHintButton();

        uiManager.logPuzzleCompletion(
            puzzleMetadata,
            currentPuzzleIndex,
            false,
            timerManager,
            puzzleStartTime
        );

        moveHandler.resetAndSolvePuzzle(currentPuzzleData, {
            onComplete: loadNextPuzzle,
            onUpdateDisplay: (isPuzzleComplete) => uiManager.updateTurnDisplay(game, isPuzzleComplete)
        });
    }

    function loadNextPuzzle() {
        currentPuzzleIndex++;
        loadPuzzle();
    }
});
