class Coin extends MovableObject {
    // x = 150;
    // y = 150;
    // height = 80;
    // width = 80;
    collected = false;
    // COIN = [
    //     '../img/8_coin/coin_1.png'
    // ];

    // constructor() {
    //     super().loadImage('../img/8_coin/coin_1.png');
    // }


    constructor(x, y) {
        super().loadImage('../img/8_coin/coin_1.png');
        this.x = x;
        this.y = y;
        this.height = 80;
        this.width = 80;
    }


    isColliding(mo) {
        if (this.collected) {
            return false;
        }
        return (this.x + 10 + 60 > mo.x &&
            this.y + 10 + 60 > mo.y &&
            this.x + 10 < mo.x &&
            this.y + 10 < mo.y + mo.height);
    }

    draw(ctx) {
        if (!this.collected) {
            super.draw(ctx);
        }
    }
}