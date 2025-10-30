class Character extends MovableObject {

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
        '../img/2_character_pepe/3_jump/J-39.png'
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
        '../img/2_character_pepe/5_dead/D-56.png'
    ];

    IMAGES_IDLE = [
        '../img/2_character_pepe/1_idle/idle/I-1.png',
        '../img/2_character_pepe/1_idle/idle/I-2.png',
        '../img/2_character_pepe/1_idle/idle/I-3.png',
        '../img/2_character_pepe/1_idle/idle/I-4.png',
        '../img/2_character_pepe/1_idle/idle/I-5.png',
        '../img/2_character_pepe/1_idle/idle/I-6.png',
        '../img/2_character_pepe/1_idle/idle/I-7.png',
        '../img/2_character_pepe/1_idle/idle/I-8.png',
        '../img/2_character_pepe/1_idle/idle/I-9.png',
        '../img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    IMAGES_LONG_IDLE = [
        '../img/2_character_pepe/1_idle/long_idle/I-11.png',
        '../img/2_character_pepe/1_idle/long_idle/I-12.png',
        '../img/2_character_pepe/1_idle/long_idle/I-13.png',
        '../img/2_character_pepe/1_idle/long_idle/I-14.png',
        '../img/2_character_pepe/1_idle/long_idle/I-15.png',
        '../img/2_character_pepe/1_idle/long_idle/I-16.png',
        '../img/2_character_pepe/1_idle/long_idle/I-17.png',
        '../img/2_character_pepe/1_idle/long_idle/I-18.png',
        '../img/2_character_pepe/1_idle/long_idle/I-19.png',
        '../img/2_character_pepe/1_idle/long_idle/I-20.png',
    ];

    x = 0;
    y = 50;
    height = 250;
    width = 100;
    walking_sound;
    world;
    speed = 5;
    minX = 150 - 720;
    coin = 0;
    bottle = 0;
    deadSoundPlayed = false;
    hurtSoundPlayed = false;

    coyoteTimeMs = 120;
    jumpBufferMs = 120;
    lastGroundedAt = 0;
    lastJumpPressedAt = -Infinity;
    prevSpace = false;
    isJumping = false;


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.applyGravity();
        this.animate();

        this.frameOffsetX = 20;
        this.frameWidth = this.width - 40;

        this.frameOffsetY = 100;
        this.frameHeight = this.height - 110;

        this.bottle = 100;
    }


    animate() {
        setInterval(() => {
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
            // if (this.world.keyBaord.SPACE && !this.isAboveGround()) {
            //     this.jump();
            // }

            const now = performance.now();
            this.handleJumpInput(now);

            this.world.camera_x = -this.x + 100;
        }, 1000 / 60);


        setInterval(() => {
            if (this.isDead()) {
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
                // this.playAnimation(this.IMAGES_JUMPING);
                this.updateJumpAnimation();
                this.hurtSoundPlayed = false;
            } else {

                if (this.isJumping) {
                    // this.img = this.imageCache[this.IMAGES_JUMPING[this.IMAGES_JUMPING.length - 1]];
                    this.img = this.imageCache[this.IMAGES_JUMPING[0]];
                    this.isJumping = false;
                }

                if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
                    this.playAnimation(this.IMAGES_WALKING);
                    this.hurtSoundPlayed = false;
                } else {
                    // this.img = this.imageCache[this.IMAGES_JUMPING[this.IMAGES_JUMPING.length - 1]];
                    this.img = this.imageCache[this.IMAGES_JUMPING[0]];
                    this.hurtSoundPlayed = false;
                }
            }
        }, 50);
    }



    jump() {
        this.speedY = 27.5;
        this.isJumping = true;
        this.world.playEffectSound(this.world.sounds.jump);
    }


    updateJumpAnimation() {
        const up_fast = 0; 
        const up_mid = 2; 
        const up_slow = 3; 
        const apex = 4; 
        const down_slow = 5; 
        const down_mid = 6; 
        const down_fast = 8; 

        const vy = this.speedY;
        let idx;

        if (vy > 12) idx = up_fast; 
        else if (vy > 6) idx = up_mid; 
        else if (vy > 2) idx = up_slow;
        else if (vy > -2) idx = apex;
        else if (vy > -8) idx = down_slow; 
        else if (vy > -14) idx = down_mid;
        else idx = down_fast;

        const path = this.IMAGES_JUMPING[idx];
        this.img = this.imageCache[path];
    }


    handleJumpInput(now) {
        const space = !!this.world?.keyBaord?.SPACE;
        if (space && !this.prevSpace) {
            this.lastJumpPressedAt = now;
        }
        this.prevSpace = space;
        const grounded = !this.isAboveGround();
        if (grounded) {
            this.lastGroundedAt = now;
        }
        const withinCoyote = (now - this.lastGroundedAt) <= this.coyoteTimeMs;
        const withinBuffer = (now - this.lastJumpPressedAt) <= this.jumpBufferMs;
        if (withinBuffer && withinCoyote && !this.isDead()) {
            this.jump();
            this.lastJumpPressedAt = -Infinity;
            this.isJumping = true;
        }
        if (grounded && this.isJumping && this.speedY === 0) {
            this.isJumping = false;
        }
    }

}