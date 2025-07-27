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
        if (!this.img) return; // 🛡️ Schutz gegen ungültige Bilder
        ctx.drawImage(this.img, Math.round(0), Math.round(0), this.width, this.height);
    }


    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken ||
            this instanceof Coin || this instanceof Bottle ||
            this instanceof Endboss || this instanceof SmallChicken
            || this instanceof ThrowableObject) {

            const frameOffsetX = this.frameOffsetX || 0;
            const frameOffsetY = this.frameOffsetY || 0;
            const frameWidth = this.frameWidth || this.width;
            const frameHeight = this.frameHeight || this.height;

            // Blue rectangle
            ctx.beginPath();
            ctx.lineWidth = '3';
            ctx.strokeStyle = 'blue';
            // ctx.rect(Math.round(0), Math.round(0), this.width, this.height);
            ctx.rect(frameOffsetX, frameOffsetY, frameWidth, frameHeight);

            ctx.stroke();
        }
    }


    loadImage(path) {
        const img = new Image();
        img.src = path;
        img.onerror = () => console.warn('Bild konnte nicht geladen werden:', path); // 🧪 TEST
        this.img = img;
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