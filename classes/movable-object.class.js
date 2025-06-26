class MovableObject {
    x;
    y;
    height;
    width;
    img;
    imageCache = {};
    currentImage = 0;


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
        // this.x -= 10;
        console.log('Moving left to', this.x);
    }


    moveRight() {
        // this.x += 10;
        console.log('Moving right to', this.x);
    }
}