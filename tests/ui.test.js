// File: tests/ui.test.js
import { UIManager } from '../assets/js/chess-wp/ui.js';
import { jest, describe, expect, test, beforeEach, afterEach } from '@jest/globals';

describe('UIManager', () => {
    let uiManager;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="puzzle-container">
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
            <div id="sessionSummaryModal" class="modal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <!-- Modal content structure -->
                    </div>
                </div>
            </div>
        `;

        global.bootstrap = {
            Modal: jest.fn().mockImplementation(() => ({
                show: jest.fn(),
                hide: jest.fn()
            })),
            getInstance: jest.fn().mockImplementation(() => ({
                show: jest.fn(),
                hide: jest.fn()
            }))
        };

        uiManager = new UIManager();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
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
                totalPuzzles: 200,
                correctPuzzles: 195,
                totalTimeMs: 2460000,
                categoryStats: {},
                failedPuzzles: []
            })
        };

        uiManager.showSessionSummary(mockStats, {});

        expect(document.getElementById('overallStats').innerHTML).toContain('41:00');
        expect(document.getElementById('overallStats').innerHTML).toContain('195/200');
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

    describe('Event Listener Management', () => {
        test('showSessionSummary should properly manage export button event listeners', () => {
            const mockExportFn = jest.fn();
            const mockStats = {
                getStats: () => ({
                    totalPuzzles: 200,
                    correctPuzzles: 195,
                    totalTimeMs: 2460000,
                    categoryStats: {},
                    failedPuzzles: []
                }),
                exportToCSV: mockExportFn
            };

            // First call to showSessionSummary
            uiManager.showSessionSummary(mockStats, {});
            const exportButton = document.getElementById('exportSummary');

            // Store the first handler
            const firstHandler = uiManager.exportClickHandler;
            expect(firstHandler).toBeDefined();

            // Trigger export
            exportButton.click();
            expect(mockExportFn).toHaveBeenCalledTimes(1);

            // Second call to showSessionSummary
            uiManager.showSessionSummary(mockStats, {});

            // Verify handler was replaced
            expect(uiManager.exportClickHandler).not.toBe(firstHandler);

            // Trigger export again
            exportButton.click();
            expect(mockExportFn).toHaveBeenCalledTimes(2);
        });

        test('resetUI should clean up event listeners', () => {
            // Setup
            const mockStats = {
                getStats: () => ({
                    totalPuzzles: 200,
                    correctPuzzles: 95,
                    totalTimeMs: 2460000,
                    categoryStats: {},
                    failedPuzzles: []
                }),
                exportToCSV: jest.fn()
            };

            // Add event listeners via showSessionSummary
            uiManager.showSessionSummary(mockStats, {});

            // Store references to handlers
            const exportHandler = uiManager.exportClickHandler;
            const newSessionHandler = uiManager.newSessionClickHandler;

            // Verify handlers were set
            expect(exportHandler).toBeDefined();
            expect(newSessionHandler).toBeDefined();

            // Reset UI
            uiManager.resetUI();

            // Verify handlers were cleaned up
            expect(uiManager.exportClickHandler).toBeNull();
            expect(uiManager.newSessionClickHandler).toBeNull();
        });

        test('multiple showSessionSummary calls should not create duplicate exports', () => {
            // Setup
            const mockExportFn = jest.fn();
            const mockStats = {
                getStats: () => ({
                    totalPuzzles: 200,
                    correctPuzzles: 195,
                    totalTimeMs: 2460000,
                    categoryStats: {},
                    failedPuzzles: []
                }),
                exportToCSV: mockExportFn
            };

            // Call showSessionSummary multiple times
            uiManager.showSessionSummary(mockStats, {});
            uiManager.showSessionSummary(mockStats, {});
            uiManager.showSessionSummary(mockStats, {});

            // Trigger export once
            document.getElementById('exportSummary').click();

            // Verify export was only called once
            expect(mockExportFn).toHaveBeenCalledTimes(1);
        });
    });
});