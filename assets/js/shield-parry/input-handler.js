export class InputHandler {
    constructor(canvas, onRestart) {
        this.keys = {};
        this.canvas = canvas;
        this.onRestart = onRestart;
        this.setupInputHandling();
    }

    setupInputHandling() {
        // Prevent default behavior for game controls
        const preventDefaultKeys = ['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'KeyR'];
        
        window.addEventListener('keydown', (e) => {
            if (preventDefaultKeys.includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;

            // Handle restart
            if (e.code === 'KeyR' && this.onRestart) {
                this.onRestart();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (preventDefaultKeys.includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = false;
        });
        
        // Prevent spacebar from scrolling when clicking the canvas
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
        
        // Prevent spacebar from scrolling when the game is focused
        this.canvas.addEventListener('keydown', (e) => {
            if (preventDefaultKeys.includes(e.code)) {
                e.preventDefault();
            }
        });
        
        // Make canvas focusable
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.style.outline = 'none';
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
} 