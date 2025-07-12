class DrawableObject {
    x;
    y;
    height;
    width;
    img;
    imageCache = {};
    currentImage = 0;


    constructor() {

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

        // // Blue rectangle
        // ctx.beginPath();
        // ctx.lineWidth = '3';
        // ctx.strokeStyle = 'blue';
        // ctx.rect(Math.round(0), Math.round(0), this.width, this.height);
        // ctx.stroke();
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
}