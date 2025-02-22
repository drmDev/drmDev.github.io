export class UIManager {
    constructor() {
        this.elements = {
            hintButton: document.getElementById('hintButton'),
            puzzleHint: document.getElementById('puzzleHint'),
            puzzleCategory: document.getElementById('puzzleCategory'),
            puzzleTitle: document.getElementById("puzzleTitle"),
            puzzleHistory: document.getElementById("puzzleHistory"),
            turnIndicator: document.getElementById('turnIndicator'),
            startPuzzle: document.getElementById("startPuzzle"),
            stopPuzzle: document.getElementById("stopPuzzle"),
            puzzleContainer: document.getElementById('puzzle-container'),
            overallStats: document.getElementById('overallStats'),
            categoryStats: document.getElementById('categoryStats'),
            failedPuzzles: document.getElementById('failedPuzzles'),
            exportSummary: document.getElementById('exportSummary'),
            startNewSession: document.getElementById('startNewSession'),
            chessboard: document.getElementById("chessboard")
        };

        this.isSessionPaused = false;
        this.exportClickHandler = null;
        this.newSessionClickHandler = null;
        this.elements.puzzleContainer.style.display = 'block';
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

    setSessionPaused(isPaused) {
        this.isSessionPaused = isPaused;
        this.toggleSessionButtons(false);
    }

    toggleSessionButtons(isStarting) {
        if (isStarting) {
            this.elements.startPuzzle.style.display = 'none';
            this.elements.stopPuzzle.style.display = 'inline';
        } else {
            this.elements.startPuzzle.style.display = 'inline';
            this.elements.stopPuzzle.style.display = 'none';

            if (this.isSessionPaused) {
                this.elements.startPuzzle.innerHTML = '<i class="fas fa-play"></i> Resume Session';
                this.elements.startPuzzle.classList.add('btn-warning');
                this.elements.startPuzzle.classList.remove('btn-primary');
            } else {
                this.elements.startPuzzle.innerHTML = '<i class="fas fa-chess-pawn"></i> Start Session';
                this.elements.startPuzzle.classList.add('btn-primary');
                this.elements.startPuzzle.classList.remove('btn-warning');
            }
        }
    }

    handleNewSession(callbacks) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('sessionSummaryModal'));
        modal.hide();
        this.isSessionPaused = false;
        if (callbacks?.onNewSession) {
            return callbacks.onNewSession();
        }
    }

    showSessionSummary(sessionStats, callbacks) {
        const stats = sessionStats.getStats();
        const successRate = (stats.correctPuzzles / stats.totalPuzzles * 100).toFixed(1);
        const minutes = Math.floor(stats.totalTimeMs / 60000);
        const seconds = ((stats.totalTimeMs % 60000) / 1000).toFixed(0);
        const totalTimeFormatted = `${minutes}:${seconds.padStart(2, '0')}`;
        
        const overallStatsHtml = `
            <div class="alert alert-info">
                <div class="stats-row">
                    <strong>Puzzles Completed:</strong> 
                    <span class="completion-stats">
                        ${stats.correctPuzzles}/${stats.totalPuzzles} (${successRate}%)
                    </span>
                </div>
                <div class="stats-row time-stats">
                    <strong>Total Time:</strong> 
                    <span class="time-display">${totalTimeFormatted}</span>
                </div>
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
            if (this.exportClickHandler) {
                this.elements.exportSummary.removeEventListener('click', this.exportClickHandler);
            }
            this.exportClickHandler = () => sessionStats.exportToCSV();
            this.elements.exportSummary.addEventListener('click', this.exportClickHandler);
        }

        if (this.elements.startNewSession) {
            if (this.newSessionClickHandler) {
                this.elements.startNewSession.removeEventListener('click', this.newSessionClickHandler);
            }
            this.newSessionClickHandler = () => this.handleNewSession(callbacks);
            this.elements.startNewSession.addEventListener('click', this.newSessionClickHandler);
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
                <a href="${puzzleLink}" target="_blank" class="puzzle-link">View Puzzle</a>
            </li>`;

        this.elements.puzzleHistory.innerHTML += historyEntry;
        return { number: puzzleNumber, time: formattedTime, success, category };
    }

    resetUI() {
        this.elements.puzzleHistory.innerHTML = '';
        this.elements.turnIndicator.textContent = '';
        this.elements.puzzleTitle.textContent = '';
        this.elements.puzzleHint.style.display = 'none';
        this.elements.hintButton.style.display = 'none';
        this.isSessionPaused = false;

        // clean up event listeners to prevent duplicate export records
        if (this.elements.exportSummary && this.exportClickHandler) {
            this.elements.exportSummary.removeEventListener('click', this.exportClickHandler);
            this.exportClickHandler = null;
        }
        if (this.elements.startNewSession && this.newSessionClickHandler) {
            this.elements.startNewSession.removeEventListener('click', this.newSessionClickHandler);
            this.newSessionClickHandler = null;
        }
    }
}