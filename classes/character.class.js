class Character extends MovableObject {

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png'
    ]

    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/H-41.png',
        'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png'
    ];

    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/D-51.png',
        'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png',
        'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png',
        'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png'
    ];

    IMAGES_IDLE = [
        'img/2_character_pepe/1_idle/idle/I-1.png',
        'img/2_character_pepe/1_idle/idle/I-2.png',
        'img/2_character_pepe/1_idle/idle/I-3.png',
        'img/2_character_pepe/1_idle/idle/I-4.png',
        'img/2_character_pepe/1_idle/idle/I-5.png',
        'img/2_character_pepe/1_idle/idle/I-6.png',
        'img/2_character_pepe/1_idle/idle/I-7.png',
        'img/2_character_pepe/1_idle/idle/I-8.png',
        'img/2_character_pepe/1_idle/idle/I-9.png',
        'img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    IMAGES_LONG_IDLE = [
        'img/2_character_pepe/1_idle/long_idle/I-11.png',
        'img/2_character_pepe/1_idle/long_idle/I-12.png',
        'img/2_character_pepe/1_idle/long_idle/I-13.png',
        'img/2_character_pepe/1_idle/long_idle/I-14.png',
        'img/2_character_pepe/1_idle/long_idle/I-15.png',
        'img/2_character_pepe/1_idle/long_idle/I-16.png',
        'img/2_character_pepe/1_idle/long_idle/I-17.png',
        'img/2_character_pepe/1_idle/long_idle/I-18.png',
        'img/2_character_pepe/1_idle/long_idle/I-19.png',
        'img/2_character_pepe/1_idle/long_idle/I-20.png',
    ];

    x = 0;
    y = 50;
    height = 250;
    width = 100;
    acceleration = 2.0;
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

    currentAnimation = null; // merkt sich, welche Animation gerade läuft
    idleTimeoutMs = 15000;              // 15s bis Sleep (Long-Idle)
    lastActivityAt = performance.now(); // Zeitstempel der letzten Aktivität

    idleFrameMs = 220;   // ruhig atmen
    sleepFrameMs = 320;  // noch ruhiger
    walkFrameMs = 80;  // ok für Laufen
    hurtFrameMs = 140;  // FPS
    deadFrameMs = 100;  // FPS (optional)
    lastAnimAt = 0;    // Zeitstempel der letzten Frame-Weiter­schaltung


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
        // this.animationTimer1 = setInterval(() => {
        setInterval(() => {
            if (isGamePaused || this.world.stopped) return;
            this.setupWalkSound();
            this.handleWalkSound();

            if (this.world.keyBaord.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
                this.otherDirection = false;
            }
            if (this.world.keyBaord.LEFT && this.x > this.minX) {
                this.moveLeft();
                this.otherDirection = true;
            }

            const anyKey =
                this.world.keyBaord.RIGHT ||
                this.world.keyBaord.LEFT ||
                this.world.keyBaord.SPACE ||
                this.world.keyBaord.UP ||
                this.world.keyBaord.DOWN ||
                this.world.keyBaord.THROW;

            const doingSomething =
                anyKey || this.isAboveGround() || this.isHurt();

            if (doingSomething) {
                this.lastActivityAt = performance.now();
                this.stopPepeSnoring?.();
                this.stopPepeCalmBreathing?.();
            }

            const now = performance.now();
            this.handleJumpInput(now);

            this.world.camera_x = -this.x + 100;
        }, 1000 / 60);


        // this.animationTimer2 = setInterval(() => {
        setInterval(() => {
            // if (isGamePaused) return;
            if (isGamePaused || this.world.stopped) return;
            const now = performance.now();

            if (this.isDead()) {
                if (this.currentAnimation !== 'dead') {
                    this.currentAnimation = 'dead';
                    this.currentImage = 0;
                    this.lastAnimAt = 0;
                }
                this.maybeAdvance(this.IMAGES_DEAD, now, this.deadFrameMs);
                this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
                this.setDeadSound();
                return;
            }

            if (this.isHurt()) {
                if (this.currentAnimation !== 'hurt') {
                    this.currentAnimation = 'hurt';
                    this.currentImage = 0;
                    this.lastAnimAt = 0;
                }
                this.maybeAdvance(this.IMAGES_HURT, now, this.hurtFrameMs);
                this.setHurtSound();
                return;
            }

            if (this.isAboveGround()) {
                this.currentAnimation = 'jump';
                this.updateJumpAnimation();
                this.hurtSoundPlayed = false;
                return;
            }

            if (this.isJumping) {
                this.img = this.imageCache[this.IMAGES_JUMPING[0]];
                this.isJumping = false;
            }

            if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
                if (this.currentAnimation !== 'walk') {
                    this.currentAnimation = 'walk';
                    this.currentImage = 0;
                    this.lastAnimAt = 0;
                }
                this.maybeAdvance(this.IMAGES_WALKING, now, this.walkFrameMs);
                this.hurtSoundPlayed = false;
            } else {
                this.pepeIsSleeping(now);
                this.hurtSoundPlayed = false;
            }
        }, 50);
    }


    setupWalkSound() {
        const walkSound = this.world.sounds.pepeWalk;
        if (!walkSound) return;
        walkSound.loop = true;
        walkSound.volume = 0.7;
    }


    handleWalkSound() {
        const walkSound = this.world.sounds.pepeWalk;
        if (!walkSound) return;
        if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
            if (walkSound.paused) this.world.playEffectSound(walkSound);
        } else {
            walkSound.pause();
        }
    }


    setHurtSound() {
        if (this.hurtSoundPlayed) return;
        const hurtSound = this.world?.sounds?.pepeHurt;
        if (!hurtSound) return;
        hurtSound.loop = false;
        hurtSound.volume = 0.2;
        this.world.playEffectSound(hurtSound);
        this.hurtSoundPlayed = true;
    }


    setDeadSound() {
        if (this.deadSoundPlayed) return;
        const deadSound = this.world?.sounds?.pepeDead;
        if (!deadSound) return;
        deadSound.loop = false;
        deadSound.volume = 0.3;
        this.world.playEffectSound(deadSound);
        this.deadSoundPlayed = true;
    }


    pepeIsSleeping(now) {
        const isSleeping = (now - this.lastActivityAt) >= this.idleTimeoutMs;
        if (isSleeping) {
            this.sleeping(now);
        } else {
            this.idle(now);
        }
    }


    sleeping(now) {
        this.stopPepeCalmBreathing?.();
        if (this.currentAnimation !== 'sleep') {
            this.currentAnimation = 'sleep';
            this.currentImage = 0;
            this.lastAnimAt = 0;
            this.playPepeSnoring();
        }
        this.maybeAdvance(this.IMAGES_LONG_IDLE, now, this.sleepFrameMs);
    }


    idle(now) {
        if (this.currentAnimation !== 'idle') {
            this.currentAnimation = 'idle';
            this.currentImage = 0;
            this.lastAnimAt = 0;
        }
        this.maybeAdvance(this.IMAGES_IDLE, now, this.idleFrameMs);
        this.playPepeCalmBreating();
    }


    maybeAdvance(images, now, frameMs) {
        if ((now - this.lastAnimAt) >= frameMs) {
            this.playAnimation(images);   // erhöht intern currentImage, setzt img
            this.lastAnimAt = now;
        }
    }


    jump() {
        this.speedY = 27.5;
        this.isJumping = true;
        // this.world.playEffectSound(this.world.sounds.jump);
        this.setupJumpSound();
    }


    setupJumpSound() {
        const jumpSound = this.world?.sounds?.pepeJump;
        if (!jumpSound) return;
        jumpSound.loop = false;
        jumpSound.volume = 0.1;
        this.world.playEffectSound(jumpSound);
    }


    updateJumpAnimation() {
        if (!this.lastJumpFrameAt) this.lastJumpFrameAt = 0;
        const now = performance.now();
        if (now - this.lastJumpFrameAt < 120) return; // nur alle 120ms neues Bild
        this.lastJumpFrameAt = now;

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


    playPepeSnoring() {
        const pepeSnoring = this.world?.sounds?.pepeSnoring;
        if (!pepeSnoring || isSoundMuted || isGamePaused || this.world?.stopped) return;
        pepeSnoring.loop = true;
        pepeSnoring.volume = 0.8;
        pepeSnoring.currentTime = 0;
        // pepeSnoring.play();
        this.world.playEffectSound(pepeSnoring);
    }


    stopPepeSnoring() {
        const pepeSnoring = this.world?.sounds?.pepeSnoring;
        if (!pepeSnoring) return;
        pepeSnoring.pause();
        pepeSnoring.currentTime = 0;
    }


    playPepeCalmBreating() {
        const calmBreathing = this.world?.sounds?.pepeCalmBreathing;
        if (!calmBreathing || !calmBreathing.paused || isSoundMuted) return;
        calmBreathing.loop = true;
        calmBreathing.volume = 0.4;
        // calmBreathing.play();
        this.world.playEffectSound(calmBreathing);
    }


    stopPepeCalmBreathing() {
        const calmBreathing = this.world?.sounds?.pepeCalmBreathing;
        if (!calmBreathing) return;
        calmBreathing.pause();
        calmBreathing.currentTime = 0;
    }
}
