/**
 * Base class for all drawable objects in the game.
 * Provides drawing, frame-debugging and image loading functionality.
 */
class DrawableObject {
    x;
    y;
    height;
    width;
    img;
    imageCache = {};
    currentImage = 0;


    /**
     * Draws the object image onto the canvas.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     */
    draw(ctx) {
        if (!this.img) return;
        ctx.drawImage(this.img, 0, 0, this.width, this.height);
    }


    /**
     * Draws a debug frame around the object if enabled.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     */
    drawFrame(ctx) {
        if (!this.shouldDrawFrame()) return;
        const frame = this.getFrameDimensions();
        this.drawDebugRectangle(ctx, frame);
    }


    /**
     * Determines whether a debug frame should be drawn.
     * @returns {boolean}
     */
    shouldDrawFrame() {
        if (!window.debugHitboxes) return false;
        return this.isFrameDrawableInstance();
    }


    /**
     * Checks whether the object type supports debug frame drawing.
     * @returns {boolean}
     */
    isFrameDrawableInstance() {
        return this instanceof Character ||
            this instanceof Chicken ||
            this instanceof Coin ||
            this instanceof Bottle ||
            this instanceof Endboss ||
            this instanceof SmallChicken ||
            this instanceof ThrowableObject;
    }


    /**
     * Calculates the dimensions of the debug frame.
     * @returns {{x:number, y:number, width:number, height:number}}
     */
    getFrameDimensions() {
        return {
            x: this.frameOffsetX || 0,
            y: this.frameOffsetY || 0,
            width: this.frameWidth || this.width,
            height: this.frameHeight || this.height
        };
    }


    /**
     * Draws the debug rectangle on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {{x:number, y:number, width:number, height:number}} frame - Frame dimensions.
     */
    drawDebugRectangle(ctx, frame) {
        ctx.beginPath();
        ctx.lineWidth = '3';
        ctx.strokeStyle = 'blue';
        ctx.rect(frame.x, frame.y, frame.width, frame.height);
        ctx.stroke();
    }


    /**
     * Loads a single image and assigns it to this object.
     * @param {string} path - Path to the image file.
     */
    loadImage(path) {
        const img = new Image();
        img.src = path;
        img.onerror = () => console.warn('Bild konnte nicht geladen werden:', path);
        this.img = img;
    }


    /**
     * Loads multiple images into the image cache.
     * @param {string[]} arrayImagesWalking - Array of image paths.
     */
    loadImages(arrayImagesWalking) {
        arrayImagesWalking.forEach((pathImagesWalking) => {
            let img = new Image();
            img.src = pathImagesWalking;
            this.imageCache[pathImagesWalking] = img;
        })
    }
}