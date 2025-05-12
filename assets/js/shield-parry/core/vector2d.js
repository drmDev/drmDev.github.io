export class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromAngle(angle, magnitude) {
        return new Vector2D(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }

    normalize() {
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
        if (magnitude === 0) return this;
        return new Vector2D(this.x / magnitude, this.y / magnitude);
    }

    scale(factor) {
        return new Vector2D(this.x * factor, this.y * factor);
    }

    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    static distance(v1, v2) {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
} 