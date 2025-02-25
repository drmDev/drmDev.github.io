export class TimerManager {
    constructor() {
        this.gameStartTime = Date.now();
        this.totalTime = 0;
        this.interval = null;
    }

    start() {
        if (this.interval) {
            this.stop();
        }

        // when resuming a session, need this to calculate it correctly
        this.gameStartTime = Date.now() - this.totalTime;
        this.interval = setInterval(() => {
            this.totalTime = Date.now() - this.gameStartTime;
            this.updateDisplay();
        }, 10);
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
        this.updateDisplay();
    }

    reset() {
        this.gameStartTime = Date.now();
        this.totalTime = 0;
        if (this.interval) {
            this.stop();
        }
        this.updateDisplay();
    }

    formatElapsedTime(ms) {
        try {
            return dayjs.duration(ms).format('HH:mm:ss.SSS');
        } catch (error) {
            console.error('Error formatting time:', error);
            return '00:00:00.000';
        }
    }

    updateDisplay() {
        document.getElementById("totalTime").textContent = this.formatElapsedTime(this.totalTime);
    }
}