export class GameState {
    constructor() {
        this.isRunning = false;
        this.isGameOver = false;
        this.isVictory = false;
        this.isVictoryAnimation = false;
        this.isSplashScreen = true;
    }

    reset() {
        this.isRunning = true;
        this.isGameOver = false;
        this.isVictory = false;
        this.isVictoryAnimation = false;
        this.isSplashScreen = false;
    }

    startGame() {
        this.isRunning = true;
        this.isSplashScreen = false;
    }

    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;
    }

    victory() {
        this.isRunning = false;
        this.isVictory = true;
        this.isVictoryAnimation = false;
    }

    startVictoryAnimation() {
        this.isVictoryAnimation = true;
    }

    endVictoryAnimation() {
        this.isVictoryAnimation = false;
    }

    isActive() {
        return this.isRunning && !this.isGameOver && !this.isVictory;
    }

    shouldShowVictory() {
        return this.isVictory || this.isVictoryAnimation;
    }
} 