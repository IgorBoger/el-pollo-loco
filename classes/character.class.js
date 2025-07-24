class Character extends MovableObject {
    x = 0;
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


    IMAGES_HURT = [
        '../img/2_character_pepe/4_hurt/H-41.png',
        '../img/2_character_pepe/4_hurt/H-42.png',
        '../img/2_character_pepe/4_hurt/H-43.png'
    ];

    IMAGES_DEAD = [
        '../img/2_character_pepe/5_dead/D-51.png',
        '../img/2_character_pepe/5_dead/D-52.png',
        '../img/2_character_pepe/5_dead/D-53.png',
        '../img/2_character_pepe/5_dead/D-54.png',
        '../img/2_character_pepe/5_dead/D-55.png',
        '../img/2_character_pepe/5_dead/D-56.png',
    ];
    walking_sound;
    world;
    speed = 8;
    minX = 150 - 720;
    coin = 0;
    bottle = 0;
    deadSoundPlayed = false;
    hurtSoundPlayed = false;



    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.applyGravity();
        this.animate();
    }


    animate() {
        setInterval((minX) => {
            if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
                if (this.world?.sounds?.walk?.paused) {
                    this.world.sounds.walk.loop = true;
                    this.world.sounds.walk.volume = 0.1;
                    this.world.playEffectSound(this.world.sounds.walk);
                }
            } else {
                this.world?.sounds?.walk?.pause();
            }
            if (this.world.keyBaord.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
                this.otherDirection = false;
            }
            if (this.world.keyBaord.LEFT && this.x > this.minX) {
                this.moveLeft();
                this.otherDirection = true;
            }
            if (this.world.keyBaord.SPACE && !this.isAboveGround()) { // Taste "Space" gedrückt und(&&) Charackter ist auf dem Boden
                this.jump();
            }

            this.world.camera_x = -this.x + 100;
            // this.world.camera_x = Math.round(-this.x);

        }, 1000 / 60);


        setInterval(() => {
            if (this.isDead()) {
                // console.log("isDead:", this.isDead());
                this.playAnimation(this.IMAGES_DEAD);
                this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
                if (!this.deadSoundPlayed) {
                    this.world.playEffectSound(this.world.sounds.dead);
                    this.deadSoundPlayed = true;
                }

            } else if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
                if (!this.hurtSoundPlayed) {
                    this.world.playEffectSound(this.world.sounds.hurt);
                    this.hurtSoundPlayed = true;
                }
            } else if (this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
                this.hurtSoundPlayed = false;
            } else {
                if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
                    this.playAnimation(this.IMAGES_WALKING);
                    this.hurtSoundPlayed = false;
                } else {
                    // Am Boden und keine Taste gedrückt → letztes Sprungbild auch der Charakter immer 
                    //  „ordentlich“ auf dem Boden steht, ohne dass er in einem falschen Frame einfriert.
                    this.img = this.imageCache[this.IMAGES_JUMPING[this.IMAGES_JUMPING.length - 1]];
                    // oder nur 8 - "this.IMAGES_JUMPING.length/9 - 1 = 8" 
                    this.hurtSoundPlayed = false;
                }
            }
        }, 50);
    }



    jump() {
        this.speedY = 27.5;
        this.world.playEffectSound(this.world.sounds.jump);
    }
}