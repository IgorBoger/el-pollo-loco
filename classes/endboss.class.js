class Endboss extends MovableObject {
    // x = 220;
    x = 1 * 720;
    y = -50;
    height = 500;
    width = 420;

    IMAGES_WALKING = [
        '../img/4_enemie_boss_chicken/2_alert/G5.png',
        '../img/4_enemie_boss_chicken/2_alert/G6.png',
        '../img/4_enemie_boss_chicken/2_alert/G7.png',
        '../img/4_enemie_boss_chicken/2_alert/G8.png',
        '../img/4_enemie_boss_chicken/2_alert/G9.png',
        '../img/4_enemie_boss_chicken/2_alert/G10.png',
        '../img/4_enemie_boss_chicken/2_alert/G11.png',
        '../img/4_enemie_boss_chicken/2_alert/G12.png',

    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]); // Startet mit dem ersten Bild aus dem Array!!!
        this.loadImages(this.IMAGES_WALKING);
        // console.log("Endboss created at", this.x, this.y);

        console.log("Endboss", this.x, this.y, this.img?.src);

        this.animate();
    }


    animate() {
        // this.moveLeft();
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 200);
    }

}