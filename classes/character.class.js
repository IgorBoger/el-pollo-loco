class Character extends MovableObject {
    x = 50;
    y = 50;
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

    IMAGES_JUMPING = [
        '../img/2_character_pepe/3_jump/J-31.png',
        '../img/2_character_pepe/3_jump/J-32.png',
        '../img/2_character_pepe/3_jump/J-33.png',
        '../img/2_character_pepe/3_jump/J-34.png',
        '../img/2_character_pepe/3_jump/J-35.png',
        '../img/2_character_pepe/3_jump/J-36.png',
        '../img/2_character_pepe/3_jump/J-37.png',
        '../img/2_character_pepe/3_jump/J-38.png',
        '../img/2_character_pepe/3_jump/J-39.png',
    ]
    world;
    speed = 8;
    minX = 150 - 720; // Startwert minus eine Kachelbreite


    constructor() {
        super().loadImage('../img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.applyGravity();
        this.animate();
    }


    animate() {
        setInterval((minX) => {
            if (this.world.keyBaord.RIGHT && this.x < this.world.level.level_end_x) {
                // console.log(this.world.backgroundTileCount);
                this.x += this.speed;
                this.otherDirection = false;
                // this.walking_sound.play();
            }


            if (this.world.keyBaord.LEFT && this.x > this.minX) {
                this.x -= this.speed;
                this.otherDirection = true;
                // this.walking_sound.play();
            }


            // console.log('this.speedY', this.speedY);


            if (this.world.keyBaord.UP && !this.isAboveGround()) {
                this.speedY = 27.5;
            }

            this.world.camera_x = -this.x + 100;
            // this.world.camera_x = Math.round(-this.x);

        }, 1000 / 60);


        setInterval(() => {
            if (this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
            } else {
                if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
                    this.playAnimation(this.IMAGES_WALKING);
                } else { // vom ChatGPT
                    // Am Boden und keine Taste gedrückt → letztes Sprungbild auch der Charakter immer 
                    //  „ordentlich“ auf dem Boden steht, ohne dass er in einem falschen Frame einfriert.
                    this.img = this.imageCache[this.IMAGES_JUMPING[this.IMAGES_JUMPING.length - 1]];
                    // oder nur 8 - "this.IMAGES_JUMPING.length/9 - 1 = 8" 
                }
            }
        }, 50);
    }


    jump() {

    }
}