export class InputHandler {
    constructor(canvas, onRestart) {
        this.canvas = canvas;
        this.onRestart = onRestart;
        this.keys = new Set();
        
        // Keys that should prevent default browser behavior
        this.preventDefaultKeys = ['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft'];
        
        // Add click event listener
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.onClick(x, y);
        });
        
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            
            // Prevent default behavior for game control keys
            if (this.preventDefaultKeys.includes(e.code)) {
                e.preventDefault();
            }
            
            // Only allow R key restart when game is over or victory screen is shown
            if (e.code === 'KeyR' && this.game && 
                (this.game.gameState.isGameOver || this.game.gameState.isVictory)) {
                this.onRestart();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
        
        // Prevent spacebar from scrolling when clicking the canvas
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
        
        // Make canvas focusable
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.style.outline = 'none';
    }
    
    setGame(game) {
        this.game = game;
    }
    
    onClick(x, y) {
        if (this.game) {
            this.game.handleClick(x, y);
        }
    }
    
    isKeyPressed(key) {
        return this.keys.has(key);
    }
} 