import { InputHandler } from './input-handler.js';
import { SoundManager } from './sound-manager.js';
import { VisualEffects } from './visual-effects.js';
import { GameState } from './core/game-state.js';
import { Player, Enemy, Projectile } from './entities/index.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Initialize managers
        this.inputHandler = new InputHandler(this.canvas, () => this.restartGame());
        this.inputHandler.setGame(this);
        this.soundManager = new SoundManager();
        this.visualEffects = new VisualEffects(this.ctx, this.canvas);
        
        // Hide health bar initially
        const healthBar = document.getElementById('health-bar');
        healthBar.style.display = 'none';
        
        // Background music
        this.backgroundMusic = null;
        this.isMuted = false;
        this.lastMuteToggle = 0;
        
        // Game state
        this.gameState = new GameState();
        
        // Initialize game objects
        this.initializeGameObjects();
        
        // Wave configuration
        this.waveConfig = {
            projectilesPerWave: 8,
            spreadAngle: Math.PI / 4,
            baseSpeed: 5
        };
        
        // Start game loop
        this.lastTime = 0;
        this.gameLoop(0);
    }
    
    initializeGameObjects() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        this.enemy = new Enemy(this.canvas.width / 2, 100);
        this.projectiles = [];
        this.reflectedProjectile = null;
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
    }
    
    restartGame() {
        this.gameState.reset();
        
        // Show health bar
        const healthBar = document.getElementById('health-bar');
        healthBar.style.display = 'block';
        
        // Start background music
        if (!this.backgroundMusic) {
            this.backgroundMusic = new Audio('/assets/sounds/shield-parry/Carmack_NoFX.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.play();
        }
        
        // Reset game objects
        this.initializeGameObjects();
        
        // Clear visual effects
        this.visualEffects.clear();
        
        // Update health bar
        this.updateHealthBar();
    }
    
    update(deltaTime) {
        if (this.gameState.isSplashScreen) return;
        if (!this.gameState.isActive()) return;
        
        // Handle mute toggle with debounce
        if (this.inputHandler.isKeyPressed('KeyM')) {
            const currentTime = performance.now();
            if (currentTime - this.lastMuteToggle > 300) { // 300ms debounce
                this.toggleMute();
                this.lastMuteToggle = currentTime;
            }
        }
        
        // Update visual effects
        this.visualEffects.update(deltaTime);
        
        // Update game objects
        this.player.update(deltaTime, this.inputHandler);
        this.enemy.update(deltaTime);
        
        // Handle shield charge
        if (this.player.isCharging) {
            const chargeHit = this.player.updateCharge();
            if (chargeHit && this.enemy.isStunned && !this.enemy.isDefeated) {
                console.log('Shield charge hit stunned enemy');
                this.enemy.defeat();
                this.visualEffects.createBloodParticles(this.enemy.x, this.enemy.y);
                this.soundManager.playSound('enemyDefeated');
                this.gameState.startVictoryAnimation();
                setTimeout(() => {
                    this.gameState.victory();
                }, 2000);
            }
        } else {
            // Only check for regular collision if not charging
            if (!this.enemy.isDefeated && !this.enemy.isStunned && 
                this.player.checkCollision(this.enemy)) {
                console.log('Player collided with enemy');
                this.player.takeDamage(100);
                this.updateHealthBar();
                this.visualEffects.triggerHitEffects();
                this.gameState.gameOver();
            }
        }
        
        // Handle shield bash initiation
        if (this.inputHandler.isKeyPressed('ShiftLeft') && 
            this.enemy.isStunned && 
            !this.player.isCharging && 
            !this.enemy.isDefeated) {
            console.log('Starting shield bash');
            this.player.startCharge(this.enemy.x, this.enemy.y);
            this.soundManager.playSound('charging');
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(deltaTime);
            
            // Check collision with player
            if (proj.checkCollision(this.player)) {
                console.log('Projectile hit player', { isGreen: proj.isGreen, isParrying: this.player.isParrying });
                if (proj.isGreen && this.player.isParrying) {
                    // Successful parry
                    console.log('Successful parry, creating reflected projectile');
                    this.reflectedProjectile = Projectile.createReflected(
                        proj.x, proj.y, this.enemy.x, this.enemy.y
                    );
                    this.soundManager.playSound('parrySuccess');
                } else {
                    // Failed parry or red projectile
                    console.log('Failed parry or red projectile hit');
                    if (this.player.takeDamage(20)) {
                        this.gameState.gameOver();
                    }
                    this.updateHealthBar();
                    this.soundManager.playSound('parryFail');
                    this.visualEffects.triggerHitEffects();
                }
                this.projectiles.splice(i, 1);
            }
            
            // Remove off-screen projectiles
            if (proj.isOffScreen(this.canvas.width, this.canvas.height)) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update reflected projectile
        if (this.reflectedProjectile) {
            this.reflectedProjectile.update(deltaTime);
            
            if (!this.enemy.isDefeated && this.reflectedProjectile.checkCollision(this.enemy)) {
                console.log('Reflected projectile hit enemy');
                this.enemy.stun(3000);
                this.soundManager.playSound('enemyStunned');
                this.visualEffects.playParryEffect();
                this.reflectedProjectile = null;
            } else if (this.reflectedProjectile.isOffScreen(this.canvas.width, this.canvas.height)) {
                console.log('Reflected projectile went off screen');
                this.reflectedProjectile = null;
            }
        }
        
        // Spawn projectile waves
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval && 
            !this.enemy.isStunned && 
            !this.enemy.isDefeated) {
            console.log('Spawning new projectile wave');
            this.spawnProjectileWave();
            this.spawnTimer = 0;
        }
    }
    
    spawnProjectileWave() {
        const dx = this.player.x - this.enemy.x;
        const dy = this.player.y - this.enemy.y;
        const centerAngle = Math.atan2(dy, dx);
        
        const angleStep = this.waveConfig.spreadAngle / (this.waveConfig.projectilesPerWave - 1);
        const startAngle = centerAngle - (this.waveConfig.spreadAngle / 2);
        
        const greenIndex = Math.floor(Math.random() * this.waveConfig.projectilesPerWave);
        
        for (let i = 0; i < this.waveConfig.projectilesPerWave; i++) {
            const angle = startAngle + (angleStep * i);
            const targetX = this.enemy.x + Math.cos(angle) * 1000;
            const targetY = this.enemy.y + Math.sin(angle) * 1000;
            
            this.projectiles.push(new Projectile(
                this.enemy.x,
                this.enemy.y,
                targetX,
                targetY,
                this.waveConfig.baseSpeed,
                i === greenIndex
            ));
        }
        
        this.soundManager.playSound('projectile');
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState.isSplashScreen) {
            this.drawSplashScreen();
            return;
        }
        
        // Draw game objects
        this.player.draw(this.ctx);
        this.enemy.draw(this.ctx);
        
        this.projectiles.forEach(proj => proj.draw(this.ctx));
        if (this.reflectedProjectile) {
            this.reflectedProjectile.draw(this.ctx);
        }
        
        // Draw visual effects
        this.visualEffects.draw();
        
        // Draw game over or victory message
        if (this.gameState.isGameOver || this.gameState.shouldShowVictory()) {
            this.drawGameOverOrVictory();
        }
    }
    
    drawSplashScreen() {
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
        this.ctx.fillText('Objective', this.canvas.width / 2, 160);
    
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Parry green projectiles to send them back at the enemy.', this.canvas.width / 2, 200);
        this.ctx.fillText('A hit stuns the enemy (turns yellow).', this.canvas.width / 2, 230);
        this.ctx.fillText('Use Shield Slam to destroy stunned enemies.', this.canvas.width / 2, 260);
    
        // Controls
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('Controls', this.canvas.width / 2, 320);
    
        this.ctx.font = '20px Arial';
        this.ctx.fillText('WASD - Move', this.canvas.width / 2, 360);
        this.ctx.fillText('SPACE - Parry', this.canvas.width / 2, 390);
        this.ctx.fillText('LEFT SHIFT - Shield Slam', this.canvas.width / 2, 420);
    
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
    }
    
    drawGameOverOrVictory() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        
        if (this.gameState.isVictoryAnimation) {
            // Draw victory animation text
            this.ctx.fillText(
                'Enemy Defeated!',
                this.canvas.width / 2,
                this.canvas.height / 2 - 40
            );
        } else {
            // Draw final victory/game over text
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
    
    updateHealthBar() {
        const healthFill = document.getElementById('health-fill');
        healthFill.style.width = `${this.player.health}%`;
    }
    
    handleClick(x, y) {
        if (this.gameState.isSplashScreen) {
            if (x >= this.canvas.width / 2 - 100 && 
                x <= this.canvas.width / 2 + 100 && 
                y >= 480 && 
                y <= 540) {
                this.restartGame();
            }
        }
    }
    
    drawHUD() {
        // Draw health bar
        const healthBar = document.getElementById('health-bar');
        healthBar.style.display = 'block';
        
        // Draw level indicator
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
            this.gameState.getCurrentLevelName(),
            this.canvas.width - 20,
            this.canvas.height - 20
        );

        // Draw mute indicator
        this.ctx.textAlign = 'left';
        this.ctx.fillText(
            this.isMuted ? '🔇 Muted' : '🔊',
            20,
            this.canvas.height - 20
        );
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.backgroundMusic) {
            this.backgroundMusic.muted = this.isMuted;
        }
        this.soundManager.setMuted(this.isMuted);
        console.log('Sound ' + (this.isMuted ? 'muted' : 'unmuted'));
    }
} 