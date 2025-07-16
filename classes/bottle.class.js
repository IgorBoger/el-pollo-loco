class Bottle extends MovableObject {
    collected = false;
    

    constructor(x, y) {
        super().loadImage('../img/6_salsa_bottle/salsa_bottle.png');
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

    // draw(ctx) {
    //     if (!this.collected) {
    //         super.draw(ctx);
    //     }
    // }
}