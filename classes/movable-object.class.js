class MovableObject {
    x;
    y;
    height;
    width;
    img;
    imageCache = {};
    currentImage = 0;
    speed = 0.1;


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


            // if (this.imageCache[pathImagesWalking] === 5) {
            //     console.log(this.imageCache[pathImagesWalking]);
            // }
        })
    };


    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;
        }, 1000 / 60);
    }


    moveRight() {
        setInterval(() => {
            this.x += this.speed;
        }, 1000 / 60);
        console.log('Moving right to', this.x);
    }
}