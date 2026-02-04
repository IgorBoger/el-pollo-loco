/**
 * Winscreen overlay shown when the player wins the game.
 * Extends {@link OverlayScreen} and draws a dimmed background.
 * @extends OverlayScreen
 */
class Winscreen extends OverlayScreen {

    winScreenConfig = {
        overlayId: 'winOverlay',
        imageSrc: 'img/You won, you lost/You Win A.png',
        overlayAlpha: 0.4,
        overlayColor: '#000',
        imageAlpha: 1,
        fadeSpeed: 0.06
    };


    /**
     * Creates the winscreen overlay.
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     */
    constructor(ctx, canvas) {
        super(ctx, canvas);
        this.init(this.winScreenConfig);
    }


    /**
     * Shows the winscreen and captures the current base frame.
     */
    show() {
        this.captureBaseFrame();
        super.show();
    }


    /**
     * Draws the winscreen using the captured base frame.
     */
    draw() {
        this.drawWithBaseFrame();
    }


    /**
     * Draws the winscreen with base frame, dim background and overlay image.
     */
    drawWithBaseFrame() {
        if (!this.visible) return;
        this.prepareDraw();
        this.drawBaseFrame();
        this.drawDimBackground(this.winScreenConfig.overlayAlpha, this.winScreenConfig.overlayColor);
        this.drawScreenImage();
        this.ctx.restore();
    }


    /**
     * Draws a dimmed background layer behind the screen image.
     * @param {number} alpha - Opacity value.
     * @param {string} color - Fill color.
     */
    drawDimBackground(alpha, color) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
}