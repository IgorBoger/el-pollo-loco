/**
 * Represents a collectible coin in the world.
 * @extends MovableObject
 */
class Coin extends MovableObject {
    collected = false;


    /**
     * Creates a coin at the given position.
     * @param {number} x - The x-position of the coin.
     * @param {number} y - The y-position of the coin.
     */
    constructor(x, y) {
        super().loadImage('img/8_coin/coin_1.png');
        this.x = x;
        this.y = y;
        this.height = 200;
        this.width = 200;
        this.frameOffsetX = 70;
        this.frameWidth = this.width - 140;
        this.frameOffsetY = 70;
        this.frameHeight = this.height - 140;
    }
}