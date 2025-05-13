import { InputHandler } from './input-handler.js';
import { SoundManager } from './sound-manager.js';
import { VisualEffects } from './visual-effects.js';

export class Game {
    constructor() {
        // Level definitions
        this.levels = [
            {
                name: 'Tutorial Level',
                enemies: [
                    { x: 400, y: 100 }
                ]
            },
            {
                name: 'Level One',
                enemies: [
                    { x: 300, y: 120 },
                    { x: 500, y: 120 }
                ]
            }
        ];
        this.currentLevelIndex = 0;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Initialize managers
        this.inputHandler = new InputHandler(this.canvas, () => this.restartGame());
        this.inputHandler.setGame(this);  // Set game reference
        this.soundManager = new SoundManager();
        this.visualEffects = new VisualEffects(this.ctx, this.canvas);
        
        // Hide health bar initially
        const healthBar = document.getElementById('health-bar');
        healthBar.style.display = 'none';
        
        // Background music
        this.backgroundMusic = null;
        this.isMuted = false;
        
        // Game state
        this.gameState = {
            isRunning: false,
            isGameOver: false,
            isVictory: false,
            isVictoryAnimation: false,
            isSplashScreen: true,  // Add splash screen state
            isGameCompleted: false
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
            chargeTarget: null,
            invulnerable: false
        };
        
        this.enemies = [];
        this.projectiles = [];
        this.reflectedProjectile = null;
        this.projectileSpeed = 5;
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2 seconds between waves
        this.parryWindow = 200; // 200ms parry window
        this.parryTimer = 0;
        
        // Wave configuration
        this.waveConfig = {
            projectilesPerWave: 8,
            spreadAngle: Math.PI / 4, // 45 degrees spread
            baseSpeed: 5.5 // 10% faster than 5
        };
        
        // Start game loop
        this.lastTime = 0;
        this.gameLoop(0);
    }
    
    restartGame() {
        // Reset game state
        this.gameState.isRunning = true;
        this.gameState.isGameOver = false;
        this.gameState.isVictory = false;
        this.gameState.isSplashScreen = false;
        // Show health bar when game starts
        const healthBar = document.getElementById('health-bar');
        healthBar.style.display = 'block';
        // Start background music if not already playing
        if (!this.backgroundMusic) {
            this.backgroundMusic = new Audio('/assets/sounds/shield-parry/Carmack_NoFX.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.play();
        }
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
            chargeTarget: null,
            invulnerable: false
        };
        // Load current level
        this.loadLevel(this.currentLevelIndex);
        // Clear arrays
        this.projectiles = [];
        this.reflectedProjectile = null;
        // Reset timers
        this.spawnTimer = 0;
        this.parryTimer = 0;
        // Clear visual effects
        this.visualEffects.clear();
        // Update health bar
        this.updateHealthBar();
    }

    loadLevel(levelIdx) {
        const level = this.levels[levelIdx];
        this.enemies = level.enemies.map((e, i) => ({
            x: e.x,
            y: e.y,
            width: 60,
            height: 60,
            isStunned: false,
            stunTimer: 0,
            isDefeated: false,
            spawnTimer: Math.random() * this.spawnInterval // offset spawn timers
        }));
    }
    
    getParryHitbox() {
        const parryWidth = this.player.width;
        const parryHeight = 30;
        const parryOffset = 15;
        
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
    
    update(deltaTime) {
        if (this.gameState.isSplashScreen) return;  // Don't update game if on splash screen
        // Final victory screen: wait for R to replay all
        if (this.gameState.isGameCompleted) {
            if (this.inputHandler.isKeyPressed('KeyR')) {
                this.currentLevelIndex = 0;
                this.gameState.isGameCompleted = false;
                this.restartGame();
            }
            return;
        }
        // Victory screen: wait for SPACE to continue
        if (this.gameState.isVictory && !this.gameState.isVictoryAnimation) {
            if (this.inputHandler.isKeyPressed('Space')) {
                this.nextLevel();
            }
            return;
        }
        // Game Over: wait for R to restart
        if (this.gameState.isGameOver) {
            if (this.inputHandler.isKeyPressed('KeyR')) {
                this.restartGame();
            }
            return;
        }
        if (!this.gameState.isRunning) return;
        
        // Update visual effects
        this.visualEffects.update(deltaTime);
        
        // Handle player movement
        if (!this.player.isCharging) {
            if (this.inputHandler.isKeyPressed('KeyW')) this.player.y -= this.player.speed;
            if (this.inputHandler.isKeyPressed('KeyS')) this.player.y += this.player.speed;
            if (this.inputHandler.isKeyPressed('KeyA')) this.player.x -= this.player.speed;
            if (this.inputHandler.isKeyPressed('KeyD')) this.player.x += this.player.speed;
            
            // Keep player within bounds
            this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
            
            // Only check collision with enemies if not charging
            if (!this.player.isCharging) {
                for (const enemy of this.enemies) {
                    if (!enemy.isDefeated && !enemy.isStunned && this.checkCollision(this.player, enemy)) {
                        this.player.health = 0;
                        this.updateHealthBar();
                        this.visualEffects.triggerHitEffects();
                        this.gameOver();
                        break;
                    }
                }
            }
        }
        
        // Handle parry input
        if (this.inputHandler.isKeyPressed('Space') && this.player.parryCooldown <= 0) {
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
        
        // Handle shield bash (charge)
        if (this.inputHandler.isKeyPressed('ShiftLeft') && !this.player.isCharging) {
            // Find all stunned, not defeated enemies
            const stunnedEnemies = this.enemies.filter(e => e.isStunned && !e.isDefeated);
            if (stunnedEnemies.length > 0) {
                // Find closest stunned enemy
                let minDist = Infinity;
                let target = null;
                for (const enemy of stunnedEnemies) {
                    const dx = (enemy.x) - (this.player.x + this.player.width / 2);
                    const dy = (enemy.y) - (this.player.y + this.player.height / 2);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < minDist) {
                        minDist = dist;
                        target = enemy;
                    }
                }
                if (target) {
                    this.player.isCharging = true;
                    this.player.invulnerable = true;
                    this.player.chargeTarget = target;
                    this.soundManager.playSound('charging');
                }
            }
        }
        
        // Update charge movement
        if (this.player.isCharging && this.player.chargeTarget && !this.player.chargeTarget.isDefeated) {
            const dx = this.player.chargeTarget.x - (this.player.x + this.player.width / 2);
            const dy = this.player.chargeTarget.y - (this.player.y + this.player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.player.chargeSpeed) {
                // Reached enemy
                this.player.chargeTarget.isDefeated = true;
                this.visualEffects.createBloodParticles(this.player.chargeTarget.x, this.player.chargeTarget.y);
                this.soundManager.playSound('enemyDefeated');
                this.player.isCharging = false;
                this.player.invulnerable = false;
                this.player.chargeTarget = null;
                this.checkVictory();
            } else {
                // Move towards enemy
                this.player.x += (dx / distance) * this.player.chargeSpeed;
                this.player.y += (dy / distance) * this.player.chargeSpeed;
            }
        } else if (this.player.isCharging && (!this.player.chargeTarget || this.player.chargeTarget.isDefeated)) {
            // If target is gone, stop charging
            this.player.isCharging = false;
            this.player.invulnerable = false;
            this.player.chargeTarget = null;
        }
        
        // Update enemy stun for all enemies
        for (const enemy of this.enemies) {
            if (enemy.isStunned && !enemy.isDefeated) {
                enemy.stunTimer -= deltaTime;
                if (enemy.stunTimer <= 0) {
                    enemy.isStunned = false;
                }
            }
        }
        
        // Spawn projectile waves for each enemy independently
        for (const enemy of this.enemies) {
            if (enemy.isStunned || enemy.isDefeated) continue;
            enemy.spawnTimer += deltaTime;
            if (enemy.spawnTimer >= this.spawnInterval) {
                this.spawnProjectileWave(enemy);
                enemy.spawnTimer = 0;
            }
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            // Update position based on velocity
            proj.x += proj.vx;
            proj.y += proj.vy;
            
            // Check collision with player (skip if charging/invulnerable)
            if (!this.player.isCharging && !this.player.invulnerable && this.checkCollision(proj, this.player)) {
                if (proj.isGreen && this.checkParryCollision(proj)) {
                    // Successful parry - create reflected projectile
                    // Find closest non-defeated enemy for targeting
                    const targetEnemy = this.enemies.find(e => !e.isDefeated);
                    if (targetEnemy) {
                        this.reflectedProjectile = {
                            x: proj.x,
                            y: proj.y,
                            width: 20,
                            height: 20,
                            color: '#00ff00',
                            targetX: targetEnemy.x,
                            targetY: targetEnemy.y,
                            speed: 10 // Faster than normal projectiles
                        };
                        // Calculate direction to enemy
                        const dx = targetEnemy.x - proj.x;
                        const dy = targetEnemy.y - proj.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        this.reflectedProjectile.vx = (dx / distance) * this.reflectedProjectile.speed;
                        this.reflectedProjectile.vy = (dy / distance) * this.reflectedProjectile.speed;
                        this.soundManager.playSound('parrySuccess');
                    }
                } else {
                    // Failed parry or red projectile
                    this.player.health -= 20;
                    this.updateHealthBar();
                    this.soundManager.playSound('parryFail');
                    this.visualEffects.triggerHitEffects();
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
        if (this.reflectedProjectile) {
            this.reflectedProjectile.x += this.reflectedProjectile.vx;
            this.reflectedProjectile.y += this.reflectedProjectile.vy;
            // Check if reflected projectile hit any enemy
            for (const enemy of this.enemies) {
                if (!enemy.isDefeated && this.checkCollision(this.reflectedProjectile, enemy)) {
                    enemy.isStunned = true;
                    enemy.stunTimer = 3000; // 3 seconds stun
                    this.soundManager.playSound('enemyStunned');
                    this.visualEffects.playParryEffect();
                    this.reflectedProjectile = null;
                    break;
                }
            }
            // Remove reflected projectile if it goes off screen
            if (this.reflectedProjectile && (this.reflectedProjectile.x < -50 || 
                this.reflectedProjectile.x > this.canvas.width + 50 ||
                this.reflectedProjectile.y < -50 || 
                this.reflectedProjectile.y > this.canvas.height + 50)) {
                this.reflectedProjectile = null;
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        // For enemy collision, use center point (works for array too)
        if (obj2 && typeof obj2.x !== 'undefined' && typeof obj2.y !== 'undefined' && typeof obj2.width !== 'undefined') {
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
    
    updateHealthBar() {
        const healthFill = document.getElementById('health-fill');
        healthFill.style.width = `${this.player.health}%`;
    }
    
    gameOver() {
        this.gameState.isGameOver = true;
        this.gameState.isRunning = false;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw mute indicator (top-left)
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#ffffff';
        if (this.isMuted) {
            this.ctx.fillText('🔇 Muted (M)', 20, 30);
        } else {
            this.ctx.fillText('🔊 (M)', 20, 30);
        }
        if (this.gameState.isSplashScreen) {
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffffff';
        
            // Title
            this.ctx.font = 'bold 36px Arial';
            this.ctx.fillText('🛡️ Shield Parry', this.canvas.width / 2, 100);
        
            // Objective
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = '#ffff66';
            this.ctx.fillText('Objective', this.canvas.width / 2, 160);
        
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('Parry green projectiles to send them back at the enemy.', this.canvas.width / 2, 200);
            this.ctx.fillText('A hit stuns the enemy (turns yellow).', this.canvas.width / 2, 230);
            this.ctx.fillText('Use Shield Slam to destroy stunned enemies.', this.canvas.width / 2, 260);
        
            // Controls
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = '#ffff66';
            this.ctx.fillText('Controls', this.canvas.width / 2, 320);
        
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('WASD - Move', this.canvas.width / 2, 360);
            this.ctx.fillText('SPACE - Parry', this.canvas.width / 2, 390);
            this.ctx.fillText('LEFT SHIFT - Shield Slam', this.canvas.width / 2, 420);
            this.ctx.fillText('M - Mute/Unmute', this.canvas.width / 2, 450);
        
            // Start Button
            const btnX = this.canvas.width / 2 - 100;
            const btnY = 480;
            const btnW = 200;
            const btnH = 60;
        
            this.ctx.fillStyle = '#00cc66';
            this.ctx.fillRect(btnX, btnY, btnW, btnH);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.strokeRect(btnX, btnY, btnW, btnH);
        
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText('Start Game', this.canvas.width / 2, btnY + 40);
        
            return;
        }
        
        // Draw player
        this.ctx.fillStyle = this.player.isParrying ? '#00ffff' : '#ffffff';
        this.ctx.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
        
        // Draw enemies
        for (const enemy of this.enemies) {
            if (!enemy.isDefeated) {
                this.ctx.fillStyle = enemy.isStunned ? '#ffff00' : '#ff00ff';
                this.ctx.fillRect(
                    enemy.x - enemy.width / 2,
                    enemy.y - enemy.height / 2,
                    enemy.width,
                    enemy.height
                );
            }
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
        
        // Draw visual effects
        this.visualEffects.draw();
        // Draw HUD: Health (bottom left), Level (bottom right)
        // Health bar is already drawn by HTML/CSS, so just draw level indicator
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.levels[this.currentLevelIndex].name, this.canvas.width - 20, this.canvas.height - 20);
        // Final victory screen
        if (this.gameState.isGameCompleted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffff66';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Congratulations!', this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.font = '28px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('You cleared all levels!', this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press R to play again', this.canvas.width / 2, this.canvas.height / 2 + 60);
            return;
        }
        // Draw game over or victory message
        if ((this.gameState.isGameOver || this.gameState.isVictory) && !this.gameState.isVictoryAnimation) {
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
            if (this.gameState.isVictory) {
                this.ctx.fillText(
                    'Press SPACE to continue',
                    this.canvas.width / 2,
                    this.canvas.height / 2 + 20
                );
            } else {
                this.ctx.fillText(
                    'Press R to play again',
                    this.canvas.width / 2,
                    this.canvas.height / 2 + 20
                );
            }
        }
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    checkVictory() {
        // Victory if all enemies are defeated
        if (this.enemies.every(e => e.isDefeated)) {
            // Set a flag to indicate we're in the victory animation phase
            this.gameState.isVictoryAnimation = true;
            // Only play sound, not another blood spurt
            this.soundManager.playSound('enemyDefeated');
            setTimeout(() => {
                this.gameState.isVictory = true;
                this.gameState.isRunning = false;
                this.gameState.isVictoryAnimation = false;
            }, 2000);
        }
    }

    nextLevel() {
        // Advance to next level, or show final victory if at the end
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            this.restartGame();
        } else {
            this.gameState.isGameCompleted = true;
            this.gameState.isVictory = false;
            this.gameState.isRunning = false;
        }
    }
    
    spawnProjectileWave(enemy) {
        // Calculate angle towards player
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
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
                x: enemy.x,
                y: enemy.y,
                width: 20,
                height: 20,
                color: isGreen ? '#00ff00' : '#ff0000',
                isGreen: isGreen,
                vx: Math.cos(angle) * this.waveConfig.baseSpeed,
                vy: Math.sin(angle) * this.waveConfig.baseSpeed
            });
        }
        // Play projectile sound
        this.soundManager.playSound('projectile');
    }

    // Add click handler for splash screen
    handleClick(x, y) {
        if (this.gameState.isSplashScreen) {
            // Check if click is within start button bounds
            if (x >= this.canvas.width / 2 - 100 && 
                x <= this.canvas.width / 2 + 100 && 
                y >= 500 && 
                y <= 550) {
                this.restartGame();
            }
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        // Toggle background music
        if (this.backgroundMusic) {
            this.backgroundMusic.muted = this.isMuted;
        }
        
        // Toggle all sound effects
        this.soundManager.setMuted(this.isMuted);
    }
} 