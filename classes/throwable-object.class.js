/**
 * Represents a throwable bottle object with rotation and splash animations.
 * Handles throwing motion, gravity, splash cleanup and removal from the world list.
 * @extends MovableObject
 */
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


    /**
     * Creates a throwable object at the given position and starts its motion.
     * @param {number} x - Start x-position.
     * @param {number} y - Start y-position.
     * @param {object} world - World reference for sounds and removal.
     * @param {number} [direction=1] - Throw direction (1 right, -1 left).
     */
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


    /**
     * Starts the throw movement and gravity.
     */
    throw() {
        this.setupThrowSound();
        this.speedY = 20;
        this.applyGravity();
        this.throwInterval = setInterval(() => {
            if (isGamePaused) return;
            this.x += 15 * this.direction;
        }, 25);
    }


    /**
     * Applies bottle gravity using an internal interval.
     * Overrides the base gravity behavior for this object.
     */
    applyGravity() {
        this.gravityInterval = setInterval(() => {
            if (isGamePaused) return;
            this.applyBottleGravityStep();
        }, 1000 / 40);
    }


    /**
     * Applies one gravity step for the bottle.
     */
    applyBottleGravityStep() {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
    }


    /**
     * Plays the throw sound effect if available.
     */
    setupThrowSound() {
        const throwSound = this.world?.sounds?.thrownBottle;
        if (throwSound) {
            throwSound.loop = false; throwSound.volume = 0.1;
            this.world.playEffectSound(throwSound);
        }
    }


    /**
     * Triggers the splash state and schedules cleanup.
     */
    splash() {
        this.setSplashState();
        this.scheduleSplashCleanup();
    }


    /**
     * Sets the object into the splashed state and stops movement values.
     */
    setSplashState() {
        this.isSplashed = true;
        this.speedY = 0;
        this.speed = 0;
    }


    /**
     * Schedules splash cleanup after a short delay.
     */
    scheduleSplashCleanup() {
        setTimeout(() => this.cleanupSplash(), 300);
    }


    /**
     * Cleans up after a splash by stopping intervals and removing the object.
     */
    cleanupSplash() {
        this.clearBottleIntervals();
        this.removeFromThrowableList();
    }


    /**
     * Clears all active bottle intervals.
     */
    clearBottleIntervals() {
        clearInterval(this.throwInterval);
        clearInterval(this.gravityInterval);
        clearInterval(this.mainInterval);
    }


    /**
     * Removes this object from the world's throwable list.
     */
    removeFromThrowableList() {
        this.world.throwableObject = this.world.throwableObject
            .filter(obj => obj !== this);
    }


    /**
     * Starts the animation loop for rotation and splash frames.
     */
    animate() {
        this.mainInterval = setInterval(() => {
            if (isGamePaused) return;
            if (this.isSplashed) this.playAnimation(this.IMAGES_SPLASHES);
            else this.playAnimation(this.IMAGES_THROW);
        }, 1000 / 60);
    }

}