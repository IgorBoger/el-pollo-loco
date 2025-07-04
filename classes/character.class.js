class Character extends MovableObject {
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
    minX = 150 - 720; // Startwert minus eine Kachelbreite


    constructor() {
        super().loadImage('../img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.IMAGES_WALKING);

        // console.log(this.minX);

        this.animate();
    }


    animate() {
        setInterval((minX) => {
            if (this.world.keyBaord.RIGHT && this.x < this.world.level.level_end_x) {
                console.log(this.world.backgroundTileCount);

                this.x += this.speed;
                this.otherDirection = false;
            }


            if (this.world.keyBaord.LEFT && this.x > this.minX) {
                this.x -= this.speed;
                this.otherDirection = true;
                console.log('is smaller like', this.x);
            }
            this.world.camera_x = -this.x + 100;
            // this.world.camera_x = Math.round(-this.x);

        }, 1000 / 60);

        setInterval(() => {
            if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
                this.playAnimation(this.IMAGES_WALKING);
            }

        }, 50);

    }


    jump() {

    }
}