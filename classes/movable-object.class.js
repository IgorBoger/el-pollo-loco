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

        // return this.x + this.width * 0.8 > mo.x &&
        //     this.x + this.width * 0.2 < mo.x + mo.width &&
        //     this.y + this.height * 0.8 > mo.y &&
        //     this.y + this.height * 0.2 < mo.y + mo.height;

        // return this.x + this.width > mo.x &&
        //     this.y + this.height > mo.y &&
        //     this.x < mo.x &&
        //     this.y < mo.y + mo.height;

        // if (character.x + character.width > chicken.x && 
        //     character.y + character.height > chicken.y && 
        //     character.x < chicken.x && 
        //     character.y < chicken.y + chicken.height) {

        // }
    }


    hit() {
        console.log('ist verletzt');
        this.energy -= 20;
        console.log('energy is ', this.energy);

        if (this instanceof Chicken || this instanceof Endboss
            || this instanceof SmallChicken) {
            this.world.playEffectSound(this.world.sounds.chicken);
        }

        if (this.energy <= 0) {
            this.energy = 0;
            // console.log(this.world.level.enemies, 'ist tot:', this.energy);
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
        return this.energy == 0;
    }


    //  || this.speedY > 0
    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }


    /**
     * Gibt true zurück, wenn der Charakter in der Luft ist (y < minY).
     * Gibt false zurück, wenn der Charakter am Boden ist.
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {//Throwable object should always fall/Wurfobjekte sollten immer fallen
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