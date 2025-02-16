class SoundManager {
    constructor() {
        this.moveSound = document.getElementById('moveSound');
        this.captureSound = document.getElementById('captureSound');
        this.checkSound = document.getElementById('checkSound');
        this.illegalSound = document.getElementById('illegalSound');
        this.successSound = document.getElementById('successSound');
        this.toggleSoundBtn = document.getElementById('toggleSound');
        this.isSoundEnabled = true;

        this.initializeSoundControls();
    }

    initializeSoundControls() {
        if (!this.toggleSoundBtn) return;

        this.isSoundEnabled = localStorage.getItem('chessSoundEnabled') !== 'false';
        this.updateSoundIcon();

        this.toggleSoundBtn.addEventListener('click', () => {
            this.isSoundEnabled = !this.isSoundEnabled;
            localStorage.setItem('chessSoundEnabled', this.isSoundEnabled);
            this.updateSoundIcon();
        });
    }

    updateSoundIcon() {
        if (!this.toggleSoundBtn) return;

        const iconClass = this.isSoundEnabled ? 'fa-volume-up' : 'fa-volume-mute';
        const buttonText = this.isSoundEnabled ? 'Sound On' : 'Sound Off';
        const buttonClass = this.isSoundEnabled ? 'btn-success' : 'btn-secondary';

        this.toggleSoundBtn.innerHTML = `<i class="fas ${iconClass}"></i> ${buttonText}`;
        this.toggleSoundBtn.className = `btn puzzle-btn ms-2 ${buttonClass}`;
    }

    playChessSound(move, position) {
        if (!this.isSoundEnabled || !this.moveSound || !this.captureSound || !this.checkSound) return;

        if (position.in_check()) {
            this.checkSound.currentTime = 0;
            this.checkSound.play();
        } else if (move.captured) {
            this.captureSound.currentTime = 0;
            this.captureSound.play();
        } else {
            this.moveSound.currentTime = 0;
            this.moveSound.play();
        }
    }

    playResultSound(success) {
        if (!this.isSoundEnabled) return;

        const sound = success ? this.successSound : this.illegalSound;
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }
}

export const soundManager = new SoundManager();