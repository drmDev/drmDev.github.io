import { GameObject } from '../core/game-object.js';
import { Vector2D } from '../core/vector2d.js';

export class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 25, 25);
        this.health = 100;
        this.isParrying = false;
        this.parryCooldown = 0;
        this.speed = 5;
        this.isCharging = false;
        this.chargeSpeed = 10;
        this.chargeTarget = null;
        
        // Set up parry hitbox
        this.parryHitbox = this.hitbox;
        this.parryHitbox.setSize(this.width, 30);
        this.parryHitbox.setOffset(0, -15);
    }

    update(deltaTime, inputHandler) {
        if (this.isCharging) {
            this.updateCharge();
        } else {
            this.updateMovement(inputHandler);
        }

        this.updateParry(deltaTime, inputHandler);
    }

    updateMovement(inputHandler) {
        if (inputHandler.isKeyPressed('KeyW')) this.y -= this.speed;
        if (inputHandler.isKeyPressed('KeyS')) this.y += this.speed;
        if (inputHandler.isKeyPressed('KeyA')) this.x -= this.speed;
        if (inputHandler.isKeyPressed('KeyD')) this.x += this.speed;

        // Keep player within bounds
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
        this.y = Math.max(0, Math.min(600 - this.height, this.y));
    }

    updateParry(deltaTime, inputHandler) {
        if (inputHandler.isKeyPressed('Space') && this.parryCooldown <= 0) {
            this.isParrying = true;
            this.parryCooldown = 500; // 500ms parry cooldown
        }

        if (this.parryCooldown > 0) {
            this.parryCooldown -= deltaTime;
            if (this.parryCooldown <= 0) {
                this.isParrying = false;
            }
        }
    }

    updateCharge() {
        if (!this.chargeTarget) return;

        const dx = this.chargeTarget.x - (this.x + this.width / 2);
        const dy = this.chargeTarget.y - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.chargeSpeed) {
            // Reached target
            this.isCharging = false;
            this.chargeTarget = null;
            return true; // Signal successful charge hit
        } else {
            // Move towards target
            this.x += (dx / distance) * this.chargeSpeed;
            this.y += (dy / distance) * this.chargeSpeed;
            return false;
        }
    }

    startCharge(targetX, targetY) {
        this.isCharging = true;
        this.chargeTarget = { x: targetX, y: targetY };
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    draw(ctx) {
        // Draw player
        ctx.fillStyle = this.isParrying ? '#00ffff' : '#ffffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw parry window indicator
        if (this.isParrying) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.parryHitbox.getBounds().x,
                this.parryHitbox.getBounds().y,
                this.parryHitbox.getBounds().width,
                this.parryHitbox.getBounds().height
            );
        }
    }
} 