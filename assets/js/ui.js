export class UIManager {
    constructor() {
        this.isSessionActive = false;
        this.elements = {
            hintButton: document.getElementById('hintButton'),
            puzzleHint: document.getElementById('puzzleHint'),
            puzzleCategory: document.getElementById('puzzleCategory'),
            puzzleTitle: document.getElementById("puzzleTitle"),
            puzzleHistory: document.getElementById("puzzleHistory"),
            turnIndicator: document.getElementById('turnIndicator'),
            startPuzzle: document.getElementById("startPuzzle"),
            stopPuzzle: document.getElementById("stopPuzzle"),
            authContainer: document.getElementById('authContainer'),
            googleSignInInfo: document.getElementById('googleSignInInfo'),
            puzzleContainer: document.getElementById('puzzle-container'),
            overallStats: document.getElementById('overallStats'),
            categoryStats: document.getElementById('categoryStats'),
            failedPuzzles: document.getElementById('failedPuzzles'),
            exportSummary: document.getElementById('exportSummary'),
            startNewSession: document.getElementById('startNewSession'),
            chessboard: document.getElementById("chessboard")
        };
    }

    isInActiveSession() {
        // console.log(`Checking session state: ${this.isSessionActive}`);
        return this.isSessionActive;
    }

    setSessionState(isActive) {
        // console.log(`Setting session state to: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
        this.isSessionActive = isActive;
    }

    showHint(category) {
        if (!category) return;

        this.elements.puzzleCategory.textContent = category;
        this.elements.puzzleHint.style.display = 'inline';
        this.elements.hintButton.disabled = true;
    }

    resetHint() {
        this.elements.hintButton.style.display = 'inline-flex';
        this.elements.hintButton.disabled = false;
        this.elements.puzzleHint.style.display = 'none';
    }

    hideHintButton() {
        this.elements.hintButton.style.display = 'none';
    }

    setPuzzleTitle(number) {
        this.elements.puzzleTitle.textContent = `Puzzle ${number}`;
    }

    updateAuthUI(session) {
        if (session) {
            this.elements.googleSignInInfo.style.display = 'none';
            this.elements.authContainer.innerHTML = `
                <div class="alert alert-success">
                    Signed in as: ${session.user.email}
                    <button onclick="window.auth.signOut()" class="btn btn-outline-danger btn-sm ms-3">
                        Sign Out
                    </button>
                </div>`;
            this.elements.puzzleContainer.style.display = 'block';
        } else {
            this.elements.googleSignInInfo.style.display = 'block';
            this.elements.authContainer.innerHTML = `
                <div class="alert alert-warning">
                    Please sign in to access puzzles
                    <button onclick="window.auth.signInWithGoogle()" class="btn btn-primary ms-3">
                        Sign in with Google
                    </button>
                </div>`;
            this.elements.puzzleContainer.style.display = 'none';
        }
    }

    toggleSessionButtons(isStarting) {
        //console.log(`Toggle Session called. Is Starting? ${isStarting}. Current session state: ${this.isSessionActive}`);

        // Prevent redundant state changes
        if (isStarting === this.isSessionActive) {
            // console.log('Skipping toggle - state already matches requested state');
            return;
        }

        // Only allow state changes in specific conditions
        if (this.isSessionActive && !isStarting) {
            //console.log('Stopping active session');
            this.setSessionState(false);
        } else if (!this.isSessionActive && isStarting) {
            //console.log('Starting new session');
            this.setSessionState(true);
        } else {
            // console.log('Invalid state transition attempted - maintaining current state');
            return;
        }

        this.elements.startPuzzle.style.display = this.isSessionActive ? 'none' : 'inline';
        this.elements.stopPuzzle.style.display = this.isSessionActive ? 'inline' : 'none';

        // console.log(`Button visibility updated - Start: ${this.elements.startPuzzle.style.display}, Stop: ${this.elements.stopPuzzle.style.display}`);
    }

    showSessionSummary(sessionStats, callbacks) {
        const stats = sessionStats.getStats();
        const successRate = (stats.correctPuzzles / stats.totalPuzzles * 100).toFixed(1);

        const overallStatsHtml = `
        <div class="alert alert-info">
            <strong>Puzzles Completed:</strong> ${stats.correctPuzzles}/${stats.totalPuzzles} (${successRate}%)
        </div>
    `;

        let categoryStatsHtml = '';
        for (const category in stats.categoryStats) {
            const catStats = stats.categoryStats[category];
            const categoryRate = (catStats.correct / catStats.total * 100).toFixed(1);
            categoryStatsHtml += `
            <div class="category-stat">
                <span>${category}</span>
                <span>${catStats.correct}/${catStats.total} (${categoryRate}%)</span>
            </div>
        `;
        }

        let failedPuzzlesHtml = '';
        if (stats.failedPuzzles.length > 0) {
            failedPuzzlesHtml = stats.failedPuzzles.map(puzzle => `
            <a href="${puzzle.url}" class="failed-puzzle-link" target="_blank">
                <i class="fas fa-external-link-alt"></i> ${puzzle.category} Puzzle #${puzzle.id}
            </a>
        `).join('');
        } else {
            failedPuzzlesHtml = '<p class="text-success">No failed puzzles! Great job!</p>';
        }

        this.elements.overallStats.innerHTML = overallStatsHtml;
        this.elements.categoryStats.innerHTML = categoryStatsHtml || '<p>No category data available</p>';
        this.elements.failedPuzzles.innerHTML = failedPuzzlesHtml;

        if (this.elements.exportSummary) {
            this.elements.exportSummary.addEventListener('click', () => {
                sessionStats.exportToCSV();
            });
        }

        if (this.elements.startNewSession) {
            this.elements.startNewSession.addEventListener('click', async () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('sessionSummaryModal'));
                modal.hide();
                if (callbacks && callbacks.onNewSession) {
                    await callbacks.onNewSession();
                }
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('sessionSummaryModal'));
        modal.show();
    }

    updateTurnDisplay(game, isPuzzleComplete = false) {
        if (isPuzzleComplete) {
            this.elements.turnIndicator.textContent = '... Loading next puzzle ...';
            this.elements.turnIndicator.className = 'turn-display loading';
        } else {
            const turnColor = game.turn() === 'w' ? 'White' : 'Black';
            this.elements.turnIndicator.textContent = `${turnColor} to move`;
            this.elements.turnIndicator.className = `turn-display ${turnColor.toLowerCase()}-turn`;
        }
    }

    logPuzzleCompletion(puzzleMetadata, currentPuzzleIndex, success, timerManager, startTime) {
        const elapsedTime = Date.now() - startTime;
        const formattedTime = timerManager.formatElapsedTime(elapsedTime);

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
                <a href="${puzzleLink}" target="_blank" class="puzzle-link">View Puzzle</a>
            </li>`;

        this.elements.puzzleHistory.innerHTML += historyEntry;

        const addedLink = this.elements.puzzleHistory.querySelector('li:last-child .puzzle-link');
        if (addedLink) {
            addedLink.addEventListener('click', (e) => {
                // console.log('Opening puzzle in new tab, maintaining current session state');
            });
        }

        return {
            number: puzzleNumber,
            time: formattedTime,
            success,
            category
        };
    }

    resetUI() {
        // console.log('Resetting UI - Maintaining current session state');
        this.elements.puzzleHistory.innerHTML = '';
        this.elements.turnIndicator.textContent = '';
        this.elements.puzzleTitle.textContent = '';
        this.elements.puzzleHint.style.display = 'none';
        this.elements.hintButton.style.display = 'none';

        // Ensure buttons reflect current session state
        this.elements.startPuzzle.style.display = this.isSessionActive ? 'none' : 'inline';
        this.elements.stopPuzzle.style.display = this.isSessionActive ? 'inline' : 'none';
    }
}