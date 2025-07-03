class Character extends MovableObject {
    // leftArrowKey = 37;
    // rightArrowKey = 39;

    x = 50;
    y = 180;
    height = 250;
    width = 100;
    IMAGES_WALKING = [
        '../img/2_character_pepe/2_walk/W-21.png',
        '../img/2_character_pepe/2_walk/W-22.png',
        '../img/2_character_pepe/2_walk/W-23.png',
        '../img/2_character_pepe/2_walk/W-24.png',
        '../img/2_character_pepe/2_walk/W-25.png',
        '../img/2_character_pepe/2_walk/W-26.png'
    ];
    world;
    speed = 8;


    constructor() {
        super().loadImage('../img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.IMAGES_WALKING);

        this.animate();
    }


    animate() {
        // console.log('charackter speed to left is: ' + this.speed);
        setInterval(() => {
            if (this.world.keyBaord.RIGHT) {
                this.x += this.speed;
                this.otherDirection = false;
                console.log('otherDirection. ' + this.otherDirection);
            }

            if (this.world.keyBaord.LEFT) {
                this.x -= this.speed;
                this.otherDirection = true;
                console.log('otherDirection. ' + this.otherDirection);

            }
        }, 1000 / 60);

        setInterval(() => {
            // if (world.keyBaord.RIGHT) { hier geht es auch ohne "this."
            if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
                let i = this.currentImage % this.IMAGES_WALKING.length; // let i = 7 % 6; => 1; Rest 1
                // i = 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5,
                // if (this.currentImage === 5) {
                //     console.log(this.currentImage);
                //     this.currentImage = 0;
                // }
                // let path = this.IMAGES_WALKING[this.currentImage];
                let path = this.IMAGES_WALKING[i];
                this.img = this.imageCache[path];
                // console.log('mudulo is ' + i);
                // console.log('currentImage ' + this.currentImage);
                this.currentImage++;
            } else {
                // world.character.world.keyBaord.RIGHT = false;
            }

        }, 50);

    }



    jump() {

    }
}