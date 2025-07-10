class Chicken extends MovableObject {
    // x = 150 + Math.random() * 500;
    y = 350;
    height = 70;
    width = 60;
    // speed = 0.3;
    // speed = 0.15 + Math.random() * 0.2;
    IMAGES_WALKING = [
        '../img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        '../img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        '../img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        // super().loadImage('../img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadImages(this.IMAGES_WALKING);
        this.x = 150 + Math.random() * 500;
        // console.log(this.x);
        this.speed = 0.15 + Math.random() * 0.2;
        this.animate();

        // // console.log('X chicken colisionPoint', this.colisionPointX);
        this.colisionPointX = this.x;
        // console.log('X chicken colisionPoint', this.colisionPointX);

        // // console.log('Y chicken colisionPoint', this.colisionPointY);
        this.colisionPointY = this.y + this.height;
        // console.log('Y chicken colisionPoint', this.colisionPointY);
    }


    animate() {
        setInterval(() => {
            this.moveLeft();
            // if (this.x <= chara) {

            // }
            // console.log(this.x);
        }, 1000 / 60);


        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 200);
    }
}