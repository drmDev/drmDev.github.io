const { UIManager } = require('../assets/js/ui.js');

describe('UIManager', () => {
    let uiManager;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="puzzle-container">
                <button id="startPuzzle">Start Session</button>
                <button id="stopPuzzle" style="display: none;">Stop Session</button>
                <button id="hintButton">Show Hint</button>
                <div id="puzzleHint"></div>
                <div id="puzzleCategory"></div>
                <div id="puzzleTitle"></div>
                <div id="puzzleHistory"></div>
                <div id="turnIndicator"></div>
            </div>
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
});