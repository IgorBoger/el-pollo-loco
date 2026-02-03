class DrawableObject {
    x;
    y;
    height;
    width;
    img;
    imageCache = {};
    currentImage = 0;
    

    draw(ctx) {
        if (!this.img) return;
        ctx.drawImage(this.img, Math.round(0), Math.round(0), this.width, this.height);
    }


    drawFrame(ctx) {
        if (!this.shouldDrawFrame()) return;
        const frame = this.getFrameDimensions();
        this.drawDebugRectangle(ctx, frame);
    }


    shouldDrawFrame() {
        if (!window.debugHitboxes) return false;
        return this.isFrameDrawableInstance();
    }


    isFrameDrawableInstance() {
        return this instanceof Character ||
            this instanceof Chicken ||
            this instanceof Coin ||
            this instanceof Bottle ||
            this instanceof Endboss ||
            this instanceof SmallChicken ||
            this instanceof ThrowableObject;
    }


    getFrameDimensions() {
        return {
            x: this.frameOffsetX || 0,
            y: this.frameOffsetY || 0,
            width: this.frameWidth || this.width,
            height: this.frameHeight || this.height
        };
    }


    drawDebugRectangle(ctx, frame) {
        ctx.beginPath();
        ctx.lineWidth = '3';
        ctx.strokeStyle = 'blue';
        ctx.rect(frame.x, frame.y, frame.width, frame.height);
        ctx.stroke();
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