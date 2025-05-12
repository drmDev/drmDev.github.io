export class SoundManager {
    constructor() {
        this.sounds = {
            projectile: new Audio('/assets/sounds/shield-parry/projectile.mp3'),
            parrySuccess: new Audio('/assets/sounds/shield-parry/parry_success.mp3'),
            parryFail: new Audio('/assets/sounds/shield-parry/player_hit.mp3'),
            enemyStunned: new Audio('/assets/sounds/shield-parry/enemy_stunned.mp3'),
            charging: new Audio('/assets/sounds/shield-parry/charging.mp3'),
            enemyDefeated: new Audio('/assets/sounds/shield-parry/enemy_defeated.mp3')
        };
        
        this.preloadSounds();
    }
    
    preloadSounds() {
        // Preload all sounds
        const loadPromises = Object.values(this.sounds).map(sound => {
            return new Promise((resolve, reject) => {
                sound.addEventListener('canplaythrough', resolve, { once: true });
                sound.addEventListener('error', reject);
                sound.load();
            });
        });
        
        Promise.all(loadPromises)
            .then(() => console.log('All sounds loaded successfully'))
            .catch(error => console.error('Error loading sounds:', error));
    }
    
    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            // Create a new instance of the sound for each play
            const soundInstance = sound.cloneNode();
            soundInstance.play().catch(error => console.error('Error playing sound:', error));
        }
    }
} 