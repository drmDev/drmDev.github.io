import { GameObject } from '../core/game-object.js';
import { Vector2D } from '../core/vector2d.js';

export class Projectile extends GameObject {
    constructor(x, y, targetX, targetY, speed, isGreen = false) {
        super(x, y, 20, 20);
        this.isGreen = isGreen;
        this.color = isGreen ? '#00ff00' : '#ff0000';
        
        // Calculate direction vector
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.velocity = new Vector2D(
            (dx / distance) * speed,
            (dy / distance) * speed
        );
    }

    update(deltaTime) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen(canvasWidth, canvasHeight) {
        return this.x < -50 || 
               this.x > canvasWidth + 50 ||
               this.y < -50 || 
               this.y > canvasHeight + 50;
    }

    static createReflected(x, y, targetX, targetY) {
        return new Projectile(x, y, targetX, targetY, 10, true);
    }
} 