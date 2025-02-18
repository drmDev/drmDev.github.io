class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {
            move: null,
            capture: null,
            check: null,
            illegal: null,
            success: null
        };

        this.toggleSoundBtn = document.getElementById('toggleSound');
        this.isSoundEnabled = true;

        this.initializeAudio();
        this.initializeSoundControls();
    }

    async initializeAudio() {
        try {
            // Create audio context on user interaction to comply with autoplay policies
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // Load all sound files
            const soundFiles = {
                move: '/assets/sounds/move.mp3',
                capture: '/assets/sounds/capture.mp3',
                check: '/assets/sounds/check.mp3',
                illegal: '/assets/sounds/illegal.mp3',
                success: '/assets/sounds/success.mp3'
            };

            // Load all sounds in parallel
            const loadPromises = Object.entries(soundFiles).map(async ([name, url]) => {
                try {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    this.sounds[name] = audioBuffer;
                } catch (error) {
                    console.error(`Failed to load sound: ${name}`, error);
                }
            });

            await Promise.all(loadPromises);
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }

    async playSound(soundBuffer) {
        if (!this.isSoundEnabled || !this.audioContext || !soundBuffer) return;

        try {
            // Resume context if suspended (mobile browsers often require this)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = soundBuffer;
            source.connect(this.audioContext.destination);
            source.start(0);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    async playChessSound(move, position) {
        if (!this.isSoundEnabled || !this.audioContext) return;

        try {
            if (position.in_check()) {
                await this.playSound(this.sounds.check);
            } else if (move.captured) {
                await this.playSound(this.sounds.capture);
            } else {
                await this.playSound(this.sounds.move);
            }
        } catch (error) {
            console.error('Error playing chess sound:', error);
        }
    }

    async playResultSound(success) {
        if (!this.isSoundEnabled || !this.audioContext) return;

        try {
            const soundBuffer = success ? this.sounds.success : this.sounds.illegal;
            await this.playSound(soundBuffer);
        } catch (error) {
            console.error('Error playing result sound:', error);
        }
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
}

export const soundManager = new SoundManager();