const PI_HALF = Math.PI / 2;
const PI_180 = Math.PI / 180;
export class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        if (x instanceof Array && y === 0) {
            this.y = x[1];
            this.x = x[0];
        }
    }
    static create(x, y) {
        return new Vector(x, y);
    }
    ;
    static add(a, b) {
        return new Vector(a.x + b.x, a.y + b.y);
    }
    ;
    static subtract(a, b) {
        return new Vector(a.x - b.x, a.y - b.y);
    }
    ;
    static random(range) {
        let v = new Vector();
        v.randomize(range);
        return v;
    }
    ;
    static distanceSquared(a, b) {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        return dx * dx + dy * dy;
    }
    ;
    static distance(a, b) {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    ;
    get magnitudeSquared() { return this.x * this.x + this.y * this.y; }
    ;
    get magnitude() { return Math.sqrt(this.magnitudeSquared); }
    ;
    get angle() { return Math.atan2(this.y, this.x) * 180 / Math.PI; }
    ;
    clone() {
        return new Vector(this.x, this.y);
    }
    ;
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    ;
    addX(x) {
        this.x += x;
        return this;
    }
    ;
    addY(y) {
        this.y += y;
        return this;
    }
    ;
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    ;
    multiply(value) {
        this.x *= value;
        this.y *= value;
        return this;
    }
    ;
    divide(value) {
        this.x /= value;
        this.y /= value;
        return this;
    }
    ;
    normalize() {
        let magnitude = this.magnitude;
        if (magnitude > 0) {
            this.divide(magnitude);
        }
        return this;
    }
    ;
    limit(treshold) {
        if (this.magnitude > treshold) {
            this.normalize();
            this.multiply(treshold);
        }
        return this;
    }
    ;
    randomize(amount = 1) {
        this.x = amount * 2 * (-.5 + Math.random());
        this.y = amount * 2 * (-.5 + Math.random());
        return this;
    }
    ;
    randomizeX(amount = 1) {
        this.x = amount * 2 * (-.5 + Math.random());
        return this;
    }
    ;
    randomizeY(amount = 1) {
        this.y = amount * 2 * (-.5 + Math.random());
        return this;
    }
    ;
    rotate(degrees) {
        let magnitude = this.magnitude;
        let angle = ((Math.atan2(this.x, this.y) * PI_HALF) + degrees) * PI_180;
        this.x = magnitude * Math.cos(angle);
        this.y = magnitude * Math.sin(angle);
        return this;
    }
    ;
    flip() {
        let temp = this.y;
        this.y = this.x;
        this.x = temp;
        return this;
    }
    ;
    invert() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    ;
    toString() {
        return this.x + ', ' + this.y;
    }
}
