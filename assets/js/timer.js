export class TimerManager {
    constructor() {
        this.gameStartTime = 0;
        this.totalTime = 0;
        this.interval = null;
    }

    start() {
        if (this.interval) {
            this.stop();
        }

        // if the timer is paused (Stop Session then Start Session later), this resumes from the original time
        this.gameStartTime = Date.now() - this.totalTime;
        this.interval = setInterval(() => {
            this.totalTime = Date.now() - this.gameStartTime;
            this.updateDisplay();
        }, 10); // 10ms delay on updating total time
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
        this.updateDisplay();
    }

    reset() {
        this.gameStartTime = 0;
        this.totalTime = 0;
        if (this.interval) {
            this.stop();
        }
        this.updateDisplay();
    }

    formatElapsedTime(ms) {
        return dayjs(ms).format('mm:ss.SSS');
    }

    updateDisplay() {
        document.getElementById("totalTime").textContent = this.formatElapsedTime(this.totalTime);
    }
}