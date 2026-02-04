/**
 * Represents a moving background cloud.
 * @extends MovableObject
 */
class Cloud extends MovableObject {
    y = 50;
    height = 300;
    width = 460;


    /**
     * Creates a cloud with a random x-position and starts its movement animation.
     */
    constructor() {
        super().loadImage('img/5_background/layers/4_clouds/1.png');

        this.x = Math.random() * 500;
        this.animate();
    }


    /**
     * Starts the cloud movement loop and respects the global pause state.
     */
    animate() {
        setInterval(() => {
            if (window.isGamePaused) return;
            this.moveLeft();
        }, 1000 / 60);
    }
}