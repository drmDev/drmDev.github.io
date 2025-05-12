class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.gameState = {
            isRunning: false,
            isGameOver: false,
            isVictory: false
        };
        
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 25,
            height: 25,
            health: 100,
            isParrying: false,
            parryCooldown: 0,
            speed: 5,
            isCharging: false,
            chargeSpeed: 10,
            chargeTarget: null
        };
        
        this.enemy = {
            x: this.canvas.width / 2,
            y: 100,
            width: 60,
            height: 60,
            isStunned: false,
            stunTimer: 0,
            isDefeated: false
        };
        
        this.projectiles = [];
        this.bloodParticles = [];
        this.reflectedProjectile = null;
        this.projectileSpeed = 5;
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2 seconds between waves
        this.parryWindow = 200; // 200ms parry window
        this.parryTimer = 0;
        
        // Visual feedback effects
        this.flashTimer = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 5;
        
        // Wave configuration
        this.waveConfig = {
            projectilesPerWave: 8,
            spreadAngle: Math.PI / 4, // 45 degrees spread
            baseSpeed: 5
        };
        
        // Sound effects
        this.sounds = {
            projectile: new Audio('/assets/sounds/shield-parry/projectile.mp3'),
            parrySuccess: new Audio('/assets/sounds/shield-parry/parry_success.mp3'),
            parryFail: new Audio('/assets/sounds/shield-parry/player_hit.mp3'),
            enemyStunned: new Audio('/assets/sounds/shield-parry/enemy_stunned.mp3'),
            charging: new Audio('/assets/sounds/shield-parry/charging.mp3'),
            enemyDefeated: new Audio('/assets/sounds/shield-parry/enemy_defeated.mp3')
        };
        
        // Preload sounds
        this.preloadSounds();
        
        // Input handling
        this.keys = {};
        this.setupInputHandling();
        
        // Start game loop
        this.lastTime = 0;
        this.gameLoop(0);
    }
    
    setupInputHandling() {
        // Prevent default behavior for game controls
        const preventDefaultKeys = ['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'KeyR'];
        
        window.addEventListener('keydown', (e) => {
            if (preventDefaultKeys.includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
            
            // Quick restart with R key
            if (e.code === 'KeyR' && (this.gameState.isGameOver || this.gameState.isVictory)) {
                this.restartGame();
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
        
        // Add focus styles
        this.canvas.style.outline = 'none';
    }
    
    restartGame() {
        // Reset game state
        this.gameState.isRunning = true;
        this.gameState.isGameOver = false;
        this.gameState.isVictory = false;
        
        // Reset player
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 25,
            height: 25,
            health: 100,
            isParrying: false,
            parryCooldown: 0,
            speed: 5,
            isCharging: false,
            chargeSpeed: 10,
            chargeTarget: null
        };
        
        // Reset enemy
        this.enemy = {
            x: this.canvas.width / 2,
            y: 100,
            width: 60,
            height: 60,
            isStunned: false,
            stunTimer: 0,
            isDefeated: false
        };
        
        // Clear arrays
        this.projectiles = [];
        this.bloodParticles = [];
        
        // Reset timers
        this.spawnTimer = 0;
        this.parryTimer = 0;
        this.flashTimer = 0;
        this.shakeTimer = 0;
        
        // Update health bar
        this.updateHealthBar();
    }
    
    getParryHitbox() {
        // Create a hitbox that matches player width but extends in front
        const parryWidth = this.player.width; // Match player width
        const parryHeight = 30; // Height of parry window
        const parryOffset = 15; // Distance in front of player
        
        return {
            x: this.player.x,
            y: this.player.y - parryOffset,
            width: parryWidth,
            height: parryHeight
        };
    }
    
    checkParryCollision(proj) {
        if (!this.player.isParrying) return false;
        
        const parryHitbox = this.getParryHitbox();
        return this.checkCollision(proj, parryHitbox);
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
    
    update(deltaTime) {
        if (!this.gameState.isRunning || this.gameState.isGameOver) return;
        
        // Update visual feedback timers
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
            if (this.flashTimer < 0) this.flashTimer = 0;
        }
        
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer < 0) this.shakeTimer = 0;
        }
        
        // Handle player movement
        if (!this.player.isCharging) {
            if (this.keys['KeyW']) this.player.y -= this.player.speed;
            if (this.keys['KeyS']) this.player.y += this.player.speed;
            if (this.keys['KeyA']) this.player.x -= this.player.speed;
            if (this.keys['KeyD']) this.player.x += this.player.speed;
            
            // Keep player within bounds
            this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
            
            // Check collision with enemy
            if (!this.enemy.isDefeated && !this.enemy.isStunned && this.checkCollision(this.player, this.enemy)) {
                this.player.health = 0;
                this.updateHealthBar();
                this.triggerHitEffects();
                this.gameOver();
            }
        }
        
        // Handle parry input
        if (this.keys['Space'] && this.player.parryCooldown <= 0) {
            this.player.isParrying = true;
            this.player.parryCooldown = 500; // 500ms parry cooldown
            this.parryTimer = this.parryWindow;
        }
        
        // Update parry timer
        if (this.parryTimer > 0) {
            this.parryTimer -= deltaTime;
            if (this.parryTimer <= 0) {
                this.player.isParrying = false;
            }
        }
        
        if (this.player.parryCooldown > 0) {
            this.player.parryCooldown -= deltaTime;
        }
        
        // Handle shield bash
        if (this.keys['ShiftLeft'] && this.enemy.isStunned && !this.player.isCharging && !this.enemy.isDefeated) {
            this.player.isCharging = true;
            this.player.chargeTarget = { x: this.enemy.x, y: this.enemy.y };
            this.playSound('charging');
        }
        
        // Update charge movement
        if (this.player.isCharging && !this.enemy.isDefeated) {
            const dx = this.player.chargeTarget.x - (this.player.x + this.player.width / 2);
            const dy = this.player.chargeTarget.y - (this.player.y + this.player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.chargeSpeed) {
                // Reached enemy
                this.enemy.isDefeated = true;
                this.player.isCharging = false;
                this.playDefeatEffect();
                this.checkVictory();
            } else {
                // Move towards enemy
                this.player.x += (dx / distance) * this.player.chargeSpeed;
                this.player.y += (dy / distance) * this.player.chargeSpeed;
            }
        }
        
        // Update enemy stun
        if (this.enemy.isStunned && !this.enemy.isDefeated) {
            this.enemy.stunTimer -= deltaTime;
            if (this.enemy.stunTimer <= 0) {
                this.enemy.isStunned = false;
            }
        }
        
        // Spawn projectile waves
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval && !this.enemy.isStunned && !this.enemy.isDefeated) {
            this.spawnProjectileWave();
            this.spawnTimer = 0;
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            // Update position based on velocity
            proj.x += proj.vx;
            proj.y += proj.vy;
            
            // Check collision with player
            if (this.checkCollision(proj, this.player)) {
                if (proj.isGreen && this.checkParryCollision(proj)) {
                    // Successful parry - create reflected projectile
                    this.reflectedProjectile = {
                        x: proj.x,
                        y: proj.y,
                        width: 20,
                        height: 20,
                        color: '#00ff00',
                        targetX: this.enemy.x,
                        targetY: this.enemy.y,
                        speed: 10 // Faster than normal projectiles
                    };
                    
                    // Calculate direction to enemy
                    const dx = this.enemy.x - proj.x;
                    const dy = this.enemy.y - proj.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    this.reflectedProjectile.vx = (dx / distance) * this.reflectedProjectile.speed;
                    this.reflectedProjectile.vy = (dy / distance) * this.reflectedProjectile.speed;
                    
                    this.playSound('parrySuccess');
                } else {
                    // Failed parry or red projectile
                    this.player.health -= 20;
                    this.updateHealthBar();
                    this.playSound('parryFail');
                    this.triggerHitEffects();
                }
                this.projectiles.splice(i, 1);
                
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
            
            // Remove projectiles that are off screen
            if (proj.x < -50 || proj.x > this.canvas.width + 50 ||
                proj.y < -50 || proj.y > this.canvas.height + 50) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update reflected projectile
        if (this.reflectedProjectile && !this.enemy.isDefeated) {
            this.reflectedProjectile.x += this.reflectedProjectile.vx;
            this.reflectedProjectile.y += this.reflectedProjectile.vy;
            
            // Check if reflected projectile hit enemy
            if (this.checkCollision(this.reflectedProjectile, this.enemy)) {
                this.enemy.isStunned = true;
                this.enemy.stunTimer = 3000; // 3 seconds stun
                this.playSound('enemyStunned');
                this.playParryEffect();
                this.reflectedProjectile = null;
            }
            
            // Remove reflected projectile if it goes off screen
            if (this.reflectedProjectile && (this.reflectedProjectile.x < -50 || 
                this.reflectedProjectile.x > this.canvas.width + 50 ||
                this.reflectedProjectile.y < -50 || 
                this.reflectedProjectile.y > this.canvas.height + 50)) {
                this.reflectedProjectile = null;
            }
        }
        
        // Update blood particles
        for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
            const particle = this.bloodParticles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // Gravity
            particle.life -= 0.02; // Fade out
            
            if (particle.life <= 0) {
                this.bloodParticles.splice(i, 1);
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        // For enemy collision, use center point
        if (obj2 === this.enemy) {
            const enemyCenterX = obj2.x;
            const enemyCenterY = obj2.y;
            const enemyRadius = obj2.width / 2;
            
            const objCenterX = obj1.x + obj1.width / 2;
            const objCenterY = obj1.y + obj1.height / 2;
            const objRadius = Math.max(obj1.width, obj1.height) / 2;
            
            const dx = objCenterX - enemyCenterX;
            const dy = objCenterY - enemyCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance < (enemyRadius + objRadius);
        }
        
        // For other collisions, use rectangle intersection
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    playParryEffect() {
        // Visual feedback for successful parry
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
    
    playDefeatEffect() {
        // Create blood particles
        this.createBloodParticles(this.enemy.x, this.enemy.y);
        
        // Play defeat sound
        this.playSound('enemyDefeated');
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    }
    
    updateHealthBar() {
        const healthFill = document.getElementById('health-fill');
        healthFill.style.width = `${this.player.health}%`;
    }
    
    gameOver() {
        this.gameState.isGameOver = true;
        this.gameState.isRunning = false;
    }
    
    triggerHitEffects() {
        this.flashTimer = 300; // 300ms red flash
        this.shakeTimer = 300; // 300ms screen shake
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        this.ctx.save();
        if (this.shakeTimer > 0) {
            const intensity = this.shakeIntensity * (this.shakeTimer / 300);
            const dx = (Math.random() - 0.5) * intensity;
            const dy = (Math.random() - 0.5) * intensity;
            this.ctx.translate(dx, dy);
        }
        
        // Draw player
        this.ctx.fillStyle = this.player.isParrying ? '#00ffff' : '#ffffff';
        this.ctx.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
        
        // Draw enemy if not defeated
        if (!this.enemy.isDefeated) {
            this.ctx.fillStyle = this.enemy.isStunned ? '#ffff00' : '#ff00ff';
            this.ctx.fillRect(
                this.enemy.x - this.enemy.width / 2,
                this.enemy.y - this.enemy.height / 2,
                this.enemy.width,
                this.enemy.height
            );
        }
        
        // Draw projectiles
        this.projectiles.forEach(proj => {
            this.ctx.fillStyle = proj.color;
            this.ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
        });

        // Draw reflected projectile
        if (this.reflectedProjectile) {
            this.ctx.fillStyle = this.reflectedProjectile.color;
            this.ctx.fillRect(
                this.reflectedProjectile.x,
                this.reflectedProjectile.y,
                this.reflectedProjectile.width,
                this.reflectedProjectile.height
            );
        }
        
        // Draw blood particles
        this.bloodParticles.forEach(particle => {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${particle.life})`;
            this.ctx.fillRect(
                particle.x,
                particle.y,
                particle.width,
                particle.height
            );
        });
        
        // Draw parry window indicator
        if (this.player.isParrying) {
            const parryHitbox = this.getParryHitbox();
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                parryHitbox.x,
                parryHitbox.y,
                parryHitbox.width,
                parryHitbox.height
            );
        }
        
        // Restore context after shake
        this.ctx.restore();
        
        // Draw red flash overlay
        if (this.flashTimer > 0) {
            const alpha = (this.flashTimer / 300) * 0.5;
            this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw game over or victory message
        if (this.gameState.isGameOver || this.gameState.isVictory) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.gameState.isVictory ? 'Victory!' : 'Game Over!',
                this.canvas.width / 2,
                this.canvas.height / 2 - 40
            );
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(
                'Press R to play again',
                this.canvas.width / 2,
                this.canvas.height / 2 + 20
            );
        }
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            // Create a new instance of the sound for each play
            const soundInstance = sound.cloneNode();
            soundInstance.play().catch(error => console.error('Error playing sound:', error));
        }
    }
    
    checkVictory() {
        if (this.enemy.isDefeated) {
            this.gameState.isVictory = true;
            this.gameState.isRunning = false;
        }
    }
    
    spawnProjectileWave() {
        // Calculate angle towards player
        const dx = this.player.x - this.enemy.x;
        const dy = this.player.y - this.enemy.y;
        const centerAngle = Math.atan2(dy, dx);
        
        // Calculate the spread between projectiles
        const angleStep = this.waveConfig.spreadAngle / (this.waveConfig.projectilesPerWave - 1);
        const startAngle = centerAngle - (this.waveConfig.spreadAngle / 2);
        
        // Choose which projectile will be green (parryable)
        const greenIndex = Math.floor(Math.random() * this.waveConfig.projectilesPerWave);
        
        // Spawn each projectile in the wave
        for (let i = 0; i < this.waveConfig.projectilesPerWave; i++) {
            const angle = startAngle + (angleStep * i);
            const isGreen = i === greenIndex;
            
            this.projectiles.push({
                x: this.enemy.x,
                y: this.enemy.y,
                width: 20,
                height: 20,
                color: isGreen ? '#00ff00' : '#ff0000',
                isGreen: isGreen,
                vx: Math.cos(angle) * this.waveConfig.baseSpeed,
                vy: Math.sin(angle) * this.waveConfig.baseSpeed
            });
        }
        
        // Play projectile sound
        this.playSound('projectile');
    }
    
    createBloodParticles(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const size = 2 + Math.random() * 4;
            
            this.bloodParticles.push({
                x: x,
                y: y,
                width: size,
                height: size,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0 // Full life
            });
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
    game.restartGame(); // Initialize the game
}); 