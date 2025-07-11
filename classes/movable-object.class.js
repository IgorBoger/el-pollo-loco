class MovableObject extends DrawableObject {
    // x;
    // y;
    // height;
    // width;
    // img;
    // imageCache = {};
    // currentImage = 0;
    speed = 0.1;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    minY = 180;
    // colisionPointX = 0;
    // colisionPointY = 0;
    energy = 100;
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


    hit(enemy) {
        this.energy -= 5;
        if (this.energy <= 0) {
            this.energy = 0;
            console.log('ENERGY ', this.energy);
            // console.log('Collision with Character, ENERGY ', this.energy);
        } else {
            this.lastHit = new Date().getTime();
            console.log(this.lastHit);

        }
    }


    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit; // Differnce in "MS"
        timePassed = timePassed / 1000;
        console.log(timePassed);
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
                // this.world.keyBaord.UP = true;
            }

            // else {
            //     if (this.y > this.minY) {
            //         this.y = this.minY;
            //     }
            //     this.speedY = 0;
            // }
        }, 1000 / 25);
    }


    /**
     * Gibt true zurück, wenn der Charakter in der Luft ist (y < minY).
     * Gibt false zurück, wenn der Charakter am Boden ist.
     */
    isAboveGround() {
        return this.y < this.minY;
    }


    draw(ctx) {
        // this.colisionPointX = this.x + this.width;
        // this.characterColisionPointY = this.y + this.height;
        // console.log(this.characterColisionPoint);
        ctx.drawImage(this.img, Math.round(0), Math.round(0), this.width, this.height);
    }


    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken) {
            // Blue rectangle
            ctx.beginPath();
            ctx.lineWidth = '3';
            ctx.strokeStyle = 'blue';
            ctx.rect(Math.round(0), Math.round(0), this.width, this.height);
            ctx.stroke();
        }
    }


    loadImage(pathCharacter) {
        this.img = new Image();
        this.img.src = pathCharacter;
    }


    /**
     * 
     * @param {Array} IMAGES_WALKING - ['img/image1.png', 'img/image2.png',...]
     */
    loadImages(arrayImagesWalking) {
        arrayImagesWalking.forEach((pathImagesWalking) => {
            let img = new Image();
            img.src = pathImagesWalking;
            this.imageCache[pathImagesWalking] = img;
        })
    };


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


    jump() {
        this.speedY = 27.5;
    }
}