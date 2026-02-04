/**
 * Represents a small chicken enemy with walking animation and death handling.
 * @extends MovableObject
 */
class SmallChicken extends MovableObject {
    y = 380;
    height = 50;
    width = 50;

    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];


    /**
     * Creates a small chicken and initializes all animation and state values.
     */
    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.initWalkImages();
        this.initDeadImage();
        this.initSpawnStats();
        this.initFrameBounds();
        this.initLoopState();
    }


    /**
     * Loads walking animation images.
     */
    initWalkImages() {
        this.loadImages(this.IMAGES_WALKING);
    }


    /**
     * Loads and stores the dead image.
     */
    initDeadImage() {
        const path = 'img/3_enemies_chicken/chicken_small/2_dead/dead.png';
        this.loadImage(path);
        this.deadImagePath = path;
    }


    /**
     * Initializes random spawn position and movement speed.
     */
    initSpawnStats() {
        this.x = 250 + Math.random() * 500;
        this.speed = 0.2 + Math.random() * 0.1;
    }


    /**
     * Sets hitbox and frame boundaries.
     */
    initFrameBounds() {
        this.frameOffsetX = 3;
        this.frameWidth = this.width - 8;
        this.frameOffsetY = 6;
        this.frameHeight = this.height - 13;
    }


    /**
     * Initializes animation timing and loop state.
     */
    initLoopState() {
        this.frameMs = 120;
        this.lastFrameTime = 0;
        this.isRemoved = false;
        this.mainInterval = null;
    }


    /**
     * Starts the update loop for movement and animation.
     */
    animate() {
        this.mainInterval = setInterval(() => {
            if (isGamePaused) return;
            this.updateSmallChicken(performance.now());
        }, 1000 / 60);
    }


    /**
     * Updates movement and animation for the current frame.
     * @param {number} now - Current timestamp.
     */
    updateSmallChicken(now) {
        if (this.isDead()) return this.handleDeath();
        this.moveLeft();
        this.updateWalkingFrames(now);
    }


    /**
     * Advances walking animation frames when the frame interval is reached.
     * @param {number} now - Current timestamp.
     */
    updateWalkingFrames(now) {
        if (!this.shouldAdvanceFrame(now)) return;
        this.playAnimation(this.IMAGES_WALKING);
        this.lastFrameTime = now;
    }


    /**
     * Determines whether the next animation frame should be displayed.
     * @param {number} now - Current timestamp.
     * @returns {boolean}
     */
    shouldAdvanceFrame(now) {
        return (now - this.lastFrameTime) >= this.frameMs;
    }


    /**
     * Handles the death state and schedules removal from the world.
     */
    handleDeath() {
        if (this.isRemoved) return;
        this.isRemoved = true;
        this.loadImage(this.deadImagePath);
        this.stopSmallChickenLoop();
        this.removeFromWorldDelayed();
    }


    /**
     * Stops the internal update loop.
     */
    stopSmallChickenLoop() {
        if (this.mainInterval) clearInterval(this.mainInterval);
    }


    /**
     * Removes the small chicken from the world after a delay.
     */
    removeFromWorldDelayed() {
        setTimeout(() => {
            if (!this.world) return;
            this.world.level.enemies =
                this.world.level.enemies.filter(e => e !== this);
        }, 2000);
    }
}