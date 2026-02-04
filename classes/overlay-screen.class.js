/**
 * Base class for fullscreen overlay screens with fade animations.
 * Handles image loading, fading and visibility toggling.
 */
class OverlayScreen {

    /**
     * Creates a new overlay screen instance.
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     */
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.visible = false;
        this.loaded = false;
        this.fade = 0;
        this.rafId = null;
        this.baseFrame = null;
        this.onFadeDone = null;
    }


    /**
     * Initializes the overlay using a configuration object.
     * @param {Object} cfg - Overlay configuration.
     */
    init(cfg) {
        this.applyConfig(cfg);
        this.createImage();
    }


    /**
     * Applies configuration values to the overlay.
     * @param {Object} cfg - Overlay configuration.
     */
    applyConfig(cfg) {
        this.overlayId = cfg.overlayId;
        this.imageSrc = cfg.imageSrc;
        this.fadeSpeed = cfg.fadeSpeed ?? 0.06;
        this.imageAlpha = cfg.imageAlpha ?? 1;
    }


    /**
     * Creates and loads the overlay image.
     */
    createImage() {
        this.image = new Image();
        this.image.src = this.imageSrc;
        this.image.onload = () => this.onImageLoaded();
    }


    /**
     * Called once the overlay image has finished loading.
     */
    onImageLoaded() {
        this.loaded = true;
        if (this.visible) this.draw();
    }


    /**
     * Shows the overlay and starts the fade-in animation.
     */
    show() {
        this.visible = true;
        this.fade = 0;
        this.toggleOverlay(true);
        this.startFadeLoop();
    }


    /**
     * Hides the overlay immediately and stops animations.
     */
    hide() {
        this.visible = false;
        this.stopFadeLoop();
        this.toggleOverlay(false);
    }


    /**
     * Hides the overlay smoothly and calls a callback when finished.
     * @param {Function} done - Callback executed after fade-out.
     */
    hideSmooth(done) {
        if (!this.visible) return done?.();
        this.onFadeDone = done || null;
        this.fadeOutStep();
    }


    /**
     * Performs one fade-out animation step.
     */
    fadeOutStep() {
        this.fade = Math.max(0, this.fade - this.fadeSpeed);
        this.draw();
        if (this.fade > 0) return requestAnimationFrame(() => this.fadeOutStep());
        this.finishFadeOut();
    }


    /**
     * Finalizes fade-out and triggers completion callback.
     */
    finishFadeOut() {
        this.visible = false;
        const cb = this.onFadeDone;
        this.onFadeDone = null;
        cb?.();
    }


    /**
     * Toggles the overlay DOM element visibility.
     * @param {boolean} isOpen - Whether the overlay should be visible.
     */
    toggleOverlay(isOpen) {
        const ov = document.getElementById(this.overlayId);
        if (!ov) return;
        ov.classList.toggle('d-none', !isOpen);
        ov.classList.toggle('d-flex', isOpen);
    }


    /**
     * Starts the fade-in animation loop.
     */
    startFadeLoop() {
        this.stopFadeLoop();
        this.rafId = requestAnimationFrame(() => this.fadeStep());
    }


    /**
     * Stops the fade animation loop.
     */
    stopFadeLoop() {
        if (!this.rafId) return;
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }


    /**
     * Performs one fade-in animation step.
     */
    fadeStep() {
        if (!this.visible) return;
        this.fade = Math.min(1, this.fade + this.fadeSpeed);
        this.draw();
        if (this.fade < 1) this.startFadeLoop();
    }


    /**
     * Draws the overlay to the canvas.
     */
    draw() {
        if (!this.visible) return;
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.drawScreenImage();
        this.ctx.restore();
    }


    /**
     * Draws the overlay image to the canvas.
     */
    drawScreenImage() {
        if (!this.loaded) return;
        this.ctx.globalAlpha = this.fade * (this.imageAlpha ?? 1);
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
    }


    /**
     * Captures the current canvas frame as a background image.
     */
    captureBaseFrame() {
        this.baseFrame = document.createElement('canvas');
        this.baseFrame.width = this.canvas.width;
        this.baseFrame.height = this.canvas.height;
        const bctx = this.baseFrame.getContext('2d');
        bctx.drawImage(this.canvas, 0, 0);
    }


    /**
     * Prepares the canvas for drawing.
     */
    prepareDraw() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }


    /**
     * Draws the captured base frame.
     */
    drawBaseFrame() {
        if (!this.baseFrame) return;
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.baseFrame, 0, 0);
    }


    /**
     * Draws the overlay using the captured base frame.
     */
    drawWithBaseFrame() {
        if (!this.visible) return;
        this.prepareDraw();
        this.drawBaseFrame();
        this.drawScreenImage();
        this.ctx.restore();
    }
}