class ThrowableObject extends MovableObject {
    height = 150;
    width = 150;

    constructor(x, y) {
        super().loadImage('../img/6_salsa_bottle/salsa_bottle.png');
        this.x = x;
        this.y = y;
        this.throw();
    }

    throw() {
        console.log('bottle is throw ');
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.x += 10;
        }, 25);
    }
}