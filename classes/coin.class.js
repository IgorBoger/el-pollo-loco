class Coin extends MovableObject {
    collected = false;


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