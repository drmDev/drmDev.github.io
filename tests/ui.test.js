// File: tests/ui.test.js
import { UIManager } from '../assets/js/ui.js';
import { jest, describe, expect, test, beforeEach, afterEach } from '@jest/globals';

describe('UIManager', () => {
    let uiManager;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="puzzle-container">
                <div class="how-to-use-container">
                    <button data-bs-toggle="collapse" data-bs-target="#howToUse">How to Use</button>
                    <div id="howToUse" class="collapse">
                        <div class="card card-body"></div>
                    </div>
                </div>
                <button id="startPuzzle" class="btn btn-primary">
                    <i class="fas fa-chess-pawn"></i> Start Session
                </button>
                <button id="stopPuzzle" style="display: none;">Stop Session</button>
                <button id="hintButton">Show Hint</button>
                <div id="puzzleHint"></div>
                <div id="puzzleCategory"></div>
                <div id="puzzleTitle"></div>
                <div id="puzzleHistory"></div>
                <div id="turnIndicator"></div>
                <div id="overallStats"></div>
                <div id="categoryStats"></div>
                <div id="failedPuzzles"></div>
                <button id="exportSummary">Export to CSV</button>
                <button id="startNewSession">Start New Session</button>
            </div>
            <div id="sessionSummaryModal"></div>
        `;

        uiManager = new UIManager();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('toggleSessionButtons should correctly toggle button visibility', () => {
        uiManager.toggleSessionButtons(true);
        expect(document.getElementById('startPuzzle').style.display).toBe('none');
        expect(document.getElementById('stopPuzzle').style.display).toBe('inline');

        uiManager.toggleSessionButtons(false);
        expect(document.getElementById('startPuzzle').style.display).toBe('inline');
        expect(document.getElementById('stopPuzzle').style.display).toBe('none');
    });

    test('toggleSessionButtons should show Resume Session text when session is paused', () => {
        const startButton = document.getElementById('startPuzzle');

        // Initial state
        expect(startButton.innerHTML).toContain('Start Session');
        expect(startButton.classList.contains('btn-primary')).toBeTruthy();

        // Set session as paused
        uiManager.isSessionPaused = true;
        uiManager.toggleSessionButtons(false);

        expect(startButton.innerHTML).toContain('Resume Session');
        expect(startButton.classList.contains('btn-warning')).toBeTruthy();
        expect(startButton.classList.contains('btn-primary')).toBeFalsy();
    });

    test('resetUI should reset session state and UI elements', () => {
        // Setup initial state
        uiManager.isSessionPaused = true;
        document.getElementById('puzzleHistory').innerHTML = 'test content';
        document.getElementById('turnIndicator').textContent = 'test content';
        document.getElementById('puzzleTitle').textContent = 'test content';
        document.getElementById('puzzleHint').style.display = 'block';
        document.getElementById('hintButton').style.display = 'block';

        // Reset UI
        uiManager.resetUI();

        // Verify all elements are reset
        expect(uiManager.isSessionPaused).toBeFalsy();
        expect(document.getElementById('puzzleHistory').innerHTML).toBe('');
        expect(document.getElementById('turnIndicator').textContent).toBe('');
        expect(document.getElementById('puzzleTitle').textContent).toBe('');
        expect(document.getElementById('puzzleHint').style.display).toBe('none');
        expect(document.getElementById('hintButton').style.display).toBe('none');
    });

    test('showSessionSummary should display modal', () => {
        // Mock bootstrap Modal
        global.bootstrap = {
            Modal: jest.fn().mockImplementation(() => ({
                show: jest.fn()
            }))
        };

        const mockStats = {
            getStats: () => ({
                totalPuzzles: 100,
                correctPuzzles: 95,
                totalTimeMs: 2460000,
                categoryStats: {},
                failedPuzzles: []
            })
        };

        uiManager.showSessionSummary(mockStats, {});

        expect(document.getElementById('overallStats').innerHTML).toContain('41:00');
        expect(document.getElementById('overallStats').innerHTML).toContain('95/100');
    });
    
    test('handleNewSession should properly reset session state', async () => {
        // Setup
        const mockModal = {
            hide: jest.fn()
        };
        global.bootstrap = {
            Modal: {
                getInstance: () => mockModal
            }
        };

        // Simulate a paused session
        uiManager.isSessionPaused = true;
        const mockCallback = jest.fn();

        // Execute
        await uiManager.handleNewSession({ onNewSession: mockCallback });

        // Assert
        expect(uiManager.isSessionPaused).toBeFalsy();
        expect(mockModal.hide).toHaveBeenCalled();
        expect(mockCallback).toHaveBeenCalled();
    });
});