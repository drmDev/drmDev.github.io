export class Hitbox {
    constructor(gameObject) {
        this.gameObject = gameObject;
        this.offsetX = 0;
        this.offsetY = 0;
        this.width = gameObject.width;
        this.height = gameObject.height;
    }

    setOffset(x, y) {
        this.offsetX = x;
        this.offsetY = y;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    getBounds() {
        return {
            x: this.gameObject.x + this.offsetX,
            y: this.gameObject.y + this.offsetY,
            width: this.width,
            height: this.height
        };
    }

    checkCollision(otherHitbox) {
        const bounds1 = this.getBounds();
        const bounds2 = otherHitbox.getBounds();

        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }

    checkCircularCollision(otherHitbox) {
        const bounds1 = this.getBounds();
        const bounds2 = otherHitbox.getBounds();

        const center1 = {
            x: bounds1.x + bounds1.width / 2,
            y: bounds1.y + bounds1.height / 2
        };
        const center2 = {
            x: bounds2.x + bounds2.width / 2,
            y: bounds2.y + bounds2.height / 2
        };

        const radius1 = Math.max(bounds1.width, bounds1.height) / 2;
        const radius2 = Math.max(bounds2.width, bounds2.height) / 2;

        const dx = center1.x - center2.x;
        const dy = center1.y - center2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (radius1 + radius2);
    }
} 