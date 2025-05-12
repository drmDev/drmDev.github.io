export class VisualEffects {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.flashTimer = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 5;
        this.bloodParticles = [];
    }

    clear() {
        this.flashTimer = 0;
        this.shakeTimer = 0;
        this.bloodParticles = [];
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

    update(deltaTime) {
        // Update visual feedback timers
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
            if (this.flashTimer < 0) this.flashTimer = 0;
        }
        
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer < 0) this.shakeTimer = 0;
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

    draw() {
        // Apply screen shake
        this.ctx.save();
        if (this.shakeTimer > 0) {
            const intensity = this.shakeIntensity * (this.shakeTimer / 300);
            const dx = (Math.random() - 0.5) * intensity;
            const dy = (Math.random() - 0.5) * intensity;
            this.ctx.translate(dx, dy);
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