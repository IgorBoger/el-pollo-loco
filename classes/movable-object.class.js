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
    gravityBaseMs = 25; // entspricht dem alten 1000/40


    // character.isColliding(chicken);
    isColliding(mo) {

        // Wenn das Objekt gesammelt wurde, keine Kollision mehr
        if (this.collected) return false;
        if (mo.collected) return false;

        const aLeft = this.x + (this.frameOffsetX || 0);
        const aRight = aLeft + (this.frameWidth || this.width);
        const aTop = this.y + (this.frameOffsetY || 0);
        const aBottom = aTop + (this.frameHeight || this.height);

        const bLeft = mo.x + (mo.frameOffsetX || 0);
        const bRight = bLeft + (mo.frameWidth || mo.width);
        const bTop = mo.y + (mo.frameOffsetY || 0);
        const bBottom = bTop + (mo.frameHeight || mo.height);

        return aRight > bLeft &&
            aLeft < bRight &&
            aBottom > bTop &&
            aTop < bBottom;
    }


    /**
 * Prüft, ob `this` von oben auf `mo` trifft (z.B. Gegner töten durch Draufspringen)
 * @param {MovableObject} mo - das andere Objekt
 * @returns {boolean}
 */
    isCollidingFromTop(mo) {
        const aLeft = this.x + (this.frameOffsetX || 0);
        const aRight = aLeft + (this.frameWidth || this.width);
        const aTop = this.y + (this.frameOffsetY || 0);
        const aBottom = aTop + (this.frameHeight || this.height);
        const aMiddleX = aLeft + (aRight - aLeft) / 2; // 👈 bleibt erhalten für Debug
        const bTop = mo.y + (mo.frameOffsetY || 0);
        const bBottom = bTop + (mo.frameHeight || mo.height);
        const bLeft = mo.x + (mo.frameOffsetX || 0);
        const bRight = bLeft + (mo.frameWidth || mo.width);
        const horizontalOverlap = aRight > bLeft && aLeft < bRight;
        const isAbove = aBottom <= bBottom + 5;
        const isFalling = this.speedY < -1;
        const result = horizontalOverlap && isAbove && isFalling;
        return result;
    }


    hit() {
        console.log(this.constructor.name, 'ist verletzt');
        this.energy -= 20;
        console.log(this.constructor.name, 'energy is ', this.energy);

        if (this instanceof Chicken || this instanceof SmallChicken) {
            this.world.playEffectSound(this.world.sounds.chickenDead);
        }

        if (this.energy <= 0) {
            this.energy = 0;
            console.log(`${this.constructor.name} ist tot:`, this.energy, 'bei X:', this.x.toFixed(0), 'Y:', this.y.toFixed(0));
        } else {
            this.lastHit = new Date().getTime();
        }
    }


    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit; // Differnce in "MS"
        timePassed = timePassed / 1000;
        // console.log(timePassed);
        return timePassed < 1;
        // return this.energy < 100;
    }


    isDead() {
        // return this.energy == 0;
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


    /**
     * Gibt true zurück, wenn der Charakter in der Luft ist (y < minY).
     * Gibt false zurück, wenn der Charakter am Boden ist.
     */
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
        // if (!images || images.length === 0) return;
        let i = this.currentImage % images.length; //(% = "Modulo") let i = 7 % 6; => 1; Rest 1
        // i = 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, so mit ersetzt die "VARIABLE++;"
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


    // jump() {
    //     this.speedY = 27.5;
    // }
}