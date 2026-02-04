/**
 * Represents a collectible bottle object in the level.
 */
class Bottle extends MovableObject {
    collected = false;


    /**
     * Creates a new bottle collectible.
     *
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super().loadImage('img/6_salsa_bottle/salsa_bottle.png');
        this.x = x;
        this.y = y;
        this.height = 80;
        this.width = 80;
        this.frameOffsetX = 30;
        this.frameWidth = this.width - 60;
        this.frameOffsetY = 10;
        this.frameHeight = this.height - 20;
    }
}