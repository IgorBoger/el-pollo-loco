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
        return this.x + this.width > mo.x &&
            this.y + this.height > mo.y &&
            this.x < mo.x &&
            this.y < mo.y + mo.height;

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

        if (this instanceof Chicken || this instanceof Endboss) {
            this.world.playEffectSound(this.world.sounds.chicken);
        }

        if (this.energy <= 0) {
            this.energy = 0;
            console.log('Charakter ist tot:', this.energy);
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