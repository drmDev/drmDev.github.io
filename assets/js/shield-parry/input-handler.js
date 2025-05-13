export class InputHandler {
    constructor(canvas, onRestart) {
        this.canvas = canvas;
        this.onRestart = onRestart;
        this.keys = new Set();
        this.lastMuteToggle = 0;
        
        // Keys that should prevent default browser behavior
        const preventDefaultKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
        
        // Add click event listener
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.onClick(x, y);
        });
        
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            
            // Handle mute toggle with debounce
            if (e.code === 'KeyM') {
                const currentTime = performance.now();
                if (currentTime - this.lastMuteToggle > 300) { // 300ms debounce
                    if (this.game) {
                        this.game.toggleMute();
                    }
                    this.lastMuteToggle = currentTime;
                }
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