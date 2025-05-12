import { Hitbox } from './hitbox.js';

export class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitbox = new Hitbox(this);
    }

    update(deltaTime) {
        // Base update method to be overridden by subclasses
    }

    draw(ctx) {
        // Base draw method to be overridden by subclasses
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // Helper method to check if this object collides with another GameObject
    checkCollision(other) {
        return this.hitbox.checkCollision(other.hitbox);
    }

    // Helper method to check if this object collides with another GameObject using circular collision
    checkCircularCollision(other) {
        return this.hitbox.checkCircularCollision(other.hitbox);
    }
} 