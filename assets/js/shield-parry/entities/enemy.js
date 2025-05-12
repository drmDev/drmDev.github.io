import { GameObject } from '../core/game-object.js';

export class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y, 60, 60);
        this.isStunned = false;
        this.stunTimer = 0;
        this.isDefeated = false;
    }

    update(deltaTime) {
        if (this.isStunned && !this.isDefeated) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
            }
        }
    }

    stun(duration) {
        this.isStunned = true;
        this.stunTimer = duration;
    }

    defeat() {
        this.isDefeated = true;
    }

    draw(ctx) {
        if (this.isDefeated) return;

        ctx.fillStyle = this.isStunned ? '#ffff00' : '#ff00ff';
        ctx.fillRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
    }
} 