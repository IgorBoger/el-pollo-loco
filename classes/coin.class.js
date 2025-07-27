class Coin extends MovableObject {
    collected = false;


    constructor(x, y) {
        super().loadImage('../img/8_coin/coin_1.png');
        this.x = x;
        this.y = y;
        this.height = 200;
        this.width = 200;

        // Wird nur für Colisionberechnung gezeichnet, danach muss weg!!!
        this.frameOffsetX = 70;
        this.frameWidth = this.width - 140;

        this.frameOffsetY = 70;
        this.frameHeight = this.height - 140;
    }


    // isColliding(mo) {
    //     if (this.collected) {
    //         return false;
    //     }
    //     return (this.x + 10 + 60 > mo.x &&
    //         this.y + 10 + 60 > mo.y &&
    //         this.x + 10 < mo.x &&
    //         this.y + 10 < mo.y + mo.height);
    // }

    // draw(ctx) {
    //     if (!this.collected) {
    //         super.draw(ctx);
    //     }
    // }
}