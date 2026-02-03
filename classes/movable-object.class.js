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


    isColliding(mo) {
        if (this.isCollectedPair(mo)) return false;
        const a = this.getCollisionBox(this);
        const b = this.getCollisionBox(mo);
        return this.boxesOverlap(a, b);
    }


    isCollectedPair(mo) {
        return this.collected || mo.collected;
    }


    getCollisionBox(obj) {
        const left = obj.x + (obj.frameOffsetX || 0);
        const top = obj.y + (obj.frameOffsetY || 0);
        const width = obj.frameWidth || obj.width;
        const height = obj.frameHeight || obj.height;
        return { left, right: left + width, top, bottom: top + height };
    }


    boxesOverlap(a, b) {
        return a.right > b.left &&
            a.left < b.right &&
            a.bottom > b.top &&
            a.top < b.bottom;
    }


    isCollidingFromTop(mo) {
        const a = this.getCollisionBox(this);
        const b = this.getCollisionBox(mo);
        const horizontalOverlap = this.isHorizontalOverlap(a, b);
        const isAbove = this.isAboveTargetBottom(a, b);
        const isFalling = this.isFallingFastEnough();
        return horizontalOverlap && isAbove && isFalling;
    }


    isHorizontalOverlap(a, b) {
        return a.right > b.left && a.left < b.right;
    }


    isAboveTargetBottom(a, b) {
        return a.bottom <= b.bottom + 5;
    }


    isFallingFastEnough() {
        return this.speedY < -1;
    }


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


    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        timePassed = timePassed / 1000;
        return timePassed < 1;
    }


    isDead() {
        return this.energy <= 0;
    }


    applyGravity() {
        this.lastGravityTime = performance.now();
        this.gravityInterval = setInterval(() => {
            this.updateGravity(performance.now());
        }, 1000 / 60);
    }


    updateGravity(now) {
        const delta = this.getDelta(now);
        this.lastGravityTime = now;
        if (this.shouldStopGravity()) return;
        this.applyGravityStep(delta);
        this.snapToGround();
    }


    getDelta(now) {
        const rawDelta = (now - this.lastGravityTime) / this.gravityBaseMs;
        return Math.min(rawDelta, 1.2);
    }


    shouldStopGravity() {
        return !this.isAboveGround() && this.speedY <= 0;
    }


    applyGravityStep(delta) {
        this.y -= this.speedY * delta;
        this.speedY -= this.acceleration * delta;
    }


    snapToGround() {
        if (this.y >= this.minY) {
            this.y = this.minY;
            if (this.speedY < 0) this.speedY = 0;
        }
    }


    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < this.minY;
        }
    }


    isOnGround() {
        return this.y >= this.minY && !(this instanceof Character);
    }


    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }


    moveLeft() {
        this.x -= this.speed;
    }


    moveRight() {
        this.x += this.speed;
    }
}