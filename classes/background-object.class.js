/**
 * Represents a background object in the level.
 * Used for parallax background layers and scenery images.
 */
class BackgroundObject extends MovableObject {
    x = 0;
    y = 0;
    height = 480;
    width = 720;


    /**
     * Creates a new background object.
     *
     * @param {string} imagePath
     * @param {number} x
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
    }
}