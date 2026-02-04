/**
 * Endscreen overlay shown when the game is over.
 * @extends OverlayScreen
 */
class Endscreen extends OverlayScreen {

    endScreenConfig = {
        overlayId: 'gameOverOverlay',
        imageSrc: 'img/9_intro_outro_screens/game_over/game over.png',
        overlayAlpha: 0,
        overlayColor: 'transparent',
        imageAlpha: 1,
        fadeSpeed: 0.06
    };


    /**
     * Creates the endscreen overlay.
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     */
    constructor(ctx, canvas) {
        super(ctx, canvas);
        this.init(this.endScreenConfig);
        this.fadeSpeed = 0.06;
    }


    /**
     * Shows the endscreen and captures the current base frame.
     */
    show() {
        this.captureBaseFrame();
        super.show();
    }


    /**
     * Draws the endscreen using the captured base frame.
     */
    draw() {
        this.drawWithBaseFrame();
    }
}