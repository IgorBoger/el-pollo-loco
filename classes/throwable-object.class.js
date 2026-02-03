class ThrowableObject extends MovableObject {
    height = 70;
    width = 70;

    IMAGES_THROW = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png',
    ]


    IMAGES_SPLASHES = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png',
    ]
    isSplashed = false;


    constructor(x, y, world, direction = 1) {
        super().loadImage(this.IMAGES_THROW[0]);
        this.loadImages(this.IMAGES_THROW);
        this.loadImages(this.IMAGES_SPLASHES);
        this.x = x;
        this.y = y;
        this.minY = 330;
        this.world = world;
        this.direction = direction;
        this.otherDirection = direction === -1;
        this.throw();
        this.animate();
    }


    throw() {
        this.setupThrowSound();
        this.speedY = 20;
        this.applyGravity();
        this.throwInterval = setInterval(() => {
            if (isGamePaused) return;
            this.x += 15 * this.direction;
        }, 25);
    }


    applyGravity() {
        this.gravityInterval = setInterval(() => {
            if (isGamePaused) return;
            this.applyBottleGravityStep();
        }, 1000 / 40);
    }


    applyBottleGravityStep() {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
    }


    setupThrowSound() {
        const throwSound = this.world?.sounds?.thrownBottle;
        if (throwSound) {
            throwSound.loop = false; throwSound.volume = 0.1;
            this.world.playEffectSound(throwSound);
        }
    }


    splash() {
        this.setSplashState();
        this.scheduleSplashCleanup();
    }


    setSplashState() {
        this.isSplashed = true;
        this.speedY = 0;
        this.speed = 0;
    }


    scheduleSplashCleanup() {
        setTimeout(() => this.cleanupSplash(), 300);
    }


    cleanupSplash() {
        this.clearBottleIntervals();
        this.removeFromThrowableList();
    }


    clearBottleIntervals() {
        clearInterval(this.throwInterval);
        clearInterval(this.gravityInterval);
        clearInterval(this.mainInterval);
    }


    removeFromThrowableList() {
        this.world.throwableObject = this.world.throwableObject
            .filter(obj => obj !== this);
    }


    animate() {
        this.mainInterval = setInterval(() => {
            if (isGamePaused) return;
            if (this.isSplashed) this.playAnimation(this.IMAGES_SPLASHES);
            else this.playAnimation(this.IMAGES_THROW);
        }, 1000 / 60);
    }

}