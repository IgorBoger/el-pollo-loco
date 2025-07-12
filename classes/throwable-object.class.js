class ThrowableObject extends MovableObject {
    // x = 120;
    // x = 80 + Math.random() * 720;
    // y = 290;
    // y = 120 + Math.random() * 200;;
    height = 150;
    width = 150;
    // IMAGES_THROW = [
    //     '../img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    //     '../img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
    // ];
    // world;

    constructor(x, y) {
        super().loadImage('../img/6_salsa_bottle/salsa_bottle.png');
        // this.loadImages(this.IMAGES_THROW);
        // this.animate();
        this.x = x;
        this.y = y;
        this.throw();
    }

    throw() {
        console.log('bottle is throw ');
        // this.speedX = 20;
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.x += 10;
        }, 25);
    }


    // animate() {
    //     setInterval(() => {
    //         // this.walking_sound.pause();
    //         if (this.world.keyBaord.THROW) {
    //             this.throw();
    //             // this.otherDirection = false;
    //             // this.walking_sound.play();
    //         }

    //         // this.world.camera_x = -this.x + 100;
    //         // this.world.camera_x = Math.round(-this.x);

    //     }, 1000 / 60);
    // }
}