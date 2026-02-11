/**
 * Base class for movable objects with collision handling, gravity and movement.
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {
    speed = 0.1;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    minY = 180;
    energy = 100;
    coin = 0;
    bottle = 0;
    lastHit = 0;
    gravityInterval = null;
    lastGravityTime = 0;
    gravityBaseMs = 25;


    /**
     * Checks collision between this object and another movable object.
     * @param {object} mo - The other object.
     * @returns {boolean}
     */
    isColliding(mo) {
        if (this.isCollectedPair(mo)) return false;
        const a = this.getCollisionBox(this);
        const b = this.getCollisionBox(mo);
        return this.boxesOverlap(a, b);
    }


    /**
     * Returns true when either object is already collected.
     * @param {object} mo - The other object.
     * @returns {boolean}
     */
    isCollectedPair(mo) {
        return this.collected || mo.collected;
    }


    /**
     * Builds a collision box based on frame offsets and sizes.
     * @param {object} obj - Object to build the box for.
     * @returns {{left:number, right:number, top:number, bottom:number}}
     */
    getCollisionBox(obj) {
        const left = obj.x + (obj.frameOffsetX || 0);
        const top = obj.y + (obj.frameOffsetY || 0);
        const width = obj.frameWidth || obj.width;
        const height = obj.frameHeight || obj.height;
        return { left, right: left + width, top, bottom: top + height };
    }


    /**
     * Checks whether two collision boxes overlap.
     * @param {{left:number, right:number, top:number, bottom:number}} a
     * @param {{left:number, right:number, top:number, bottom:number}} b
     * @returns {boolean}
     */
    boxesOverlap(a, b) {
        return a.right > b.left &&
            a.left < b.right &&
            a.bottom > b.top &&
            a.top < b.bottom;
    }


    /**
     * Checks collision from top (e.g. stomping) against another object.
     * @param {object} mo - The other object.
     * @returns {boolean}
     */
    isCollidingFromTop(mo) {
        const a = this.getCollisionBox(this);
        const b = this.getCollisionBox(mo);
        const horizontalOverlap = this.isHorizontalOverlap(a, b);
        const isAbove = this.isAboveTargetBottom(a, b);
        const isFalling = this.isFallingFastEnough();
        return horizontalOverlap && isAbove && isFalling;
    }


    /**
     * Checks horizontal overlap of two collision boxes.
     * @param {{left:number, right:number, top:number, bottom:number}} a
     * @param {{left:number, right:number, top:number, bottom:number}} b
     * @returns {boolean}
     */
    isHorizontalOverlap(a, b) {
        return a.right > b.left && a.left < b.right;
    }


    /**
     * Checks whether this object is above the target bottom edge (with tolerance).
     * @param {{bottom:number}} a
     * @param {{bottom:number}} b
     * @returns {boolean}
     */
    isAboveTargetBottom(a, b) {
        return a.bottom <= b.bottom + 5;
    }


    /**
     * Checks whether the object is falling fast enough to count as a top hit.
     * @returns {boolean}
     */
    isFallingFastEnough() {
        return this.speedY < -1;
    }


    /**
     * Applies damage to this object and triggers sounds for certain enemy types.
     */
    hit() {
        this.energy -= 20;
        if (this instanceof Chicken || this instanceof SmallChicken) {
            this.world.playEffectSound(this.world.sounds.chickenDead);
        }
        if (this.energy <= 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }


    /**
     * Checks whether the object is currently in a hurt state.
     * @returns {boolean}
     */
    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        timePassed = timePassed / 1000;
        return timePassed < 1;
    }


    /**
     * Checks whether the object has no energy left.
     * @returns {boolean}
     */
    isDead() {
        return this.energy <= 0;
    }


    /**
     * Starts the gravity update loop.
     */
    applyGravity() {
        this.lastGravityTime = performance.now();
        this.gravityInterval = setInterval(() => {
            this.updateGravity(performance.now());
        }, 1000 / 60);
    }


    /**
     * Updates gravity for the current frame.
     * @param {number} now - Current timestamp.
     */
    updateGravity(now) {
        if (this.shouldPausePhysics()) return;
        const delta = this.getDelta(now);
        this.lastGravityTime = now;
        if (this.shouldStopGravity()) return;
        this.applyGravityStep(delta);
        this.snapToGround();
    }


    /**
 * Checks whether physics updates should be paused.
 *
 * @returns {boolean}
 */
    shouldPausePhysics() {
        if (window.isGamePaused) return true;
        return !!this.world?.stopped;
    }


    /**
     * Calculates a normalized delta factor for gravity updates.
     * @param {number} now - Current timestamp.
     * @returns {number}
     */
    getDelta(now) {
        const rawDelta = (now - this.lastGravityTime) / this.gravityBaseMs;
        return Math.min(rawDelta, 1.2);
    }


    /**
     * Determines whether gravity updates should stop.
     * @returns {boolean}
     */
    shouldStopGravity() {
        return !this.isAboveGround() && this.speedY <= 0;
    }


    /**
     * Applies one gravity step using the given delta.
     * @param {number} delta
     */
    applyGravityStep(delta) {
        this.y -= this.speedY * delta;
        this.speedY -= this.acceleration * delta;
    }


    /**
     * Snaps the object to the ground and clamps vertical speed.
     */
    snapToGround() {
        if (this.y >= this.minY) {
            this.y = this.minY;
            if (this.speedY < 0) this.speedY = 0;
        }
    }


    /**
     * Checks whether the object is above ground.
     * @returns {boolean}
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < this.minY;
        }
    }


    /**
     * Checks whether the object is on the ground.
     * @returns {boolean}
     */
    isOnGround() {
        return this.y >= this.minY && !(this instanceof Character);
    }


    /**
     * Advances the current animation frame using the given image list.
     * @param {string[]} images - Animation frame image paths.
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }


    /**
     * Moves the object to the left using its speed.
     */
    moveLeft() {
        this.x -= this.speed;
    }


    /**
     * Moves the object to the right using its speed.
     */
    moveRight() {
        this.x += this.speed;
    }
}