export class VisualEffects {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.particles = [];
        this.hitEffects = [];
        this.flashTimer = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 5;
    }

    clear() {
        this.flashTimer = 0;
        this.shakeTimer = 0;
        this.particles = [];
        this.hitEffects = [];
    }

    triggerHitEffects() {
        this.flashTimer = 300; // 300ms red flash
        this.shakeTimer = 300; // 300ms screen shake
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

    createBloodParticles(x, y) {
        const particleCount = 30; // Increased particle count
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = 2 + Math.random() * 3; // Increased speed range
            const size = 3 + Math.random() * 4; // Increased size range
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                life: 1.0, // Full life
                color: '#ff0000'
            });
        }
    }

    update(deltaTime) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= deltaTime / 2000; // Slower fade out (2 seconds)
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update hit effects
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            const effect = this.hitEffects[i];
            effect.life -= deltaTime / 500;
            
            if (effect.life <= 0) {
                this.hitEffects.splice(i, 1);
            }
        }

        // Update visual feedback timers
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
            if (this.flashTimer < 0) this.flashTimer = 0;
        }
        
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer < 0) this.shakeTimer = 0;
        }
    }

    draw() {
        // Apply screen shake
        this.ctx.save();
        if (this.shakeTimer > 0) {
            const intensity = this.shakeIntensity * (this.shakeTimer / 300);
            const dx = (Math.random() - 0.5) * intensity;
            const dy = (Math.random() - 0.5) * intensity;
            this.ctx.translate(dx, dy);
        }

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw hit effects
        this.hitEffects.forEach(effect => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${effect.life})`;
            this.ctx.fillRect(
                effect.x - effect.size / 2,
                effect.y - effect.size / 2,
                effect.size,
                effect.size
            );
        });

        // Restore context after shake
        this.ctx.restore();
        
        // Draw red flash overlay
        if (this.flashTimer > 0) {
            const alpha = (this.flashTimer / 300) * 0.5;
            this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
} 