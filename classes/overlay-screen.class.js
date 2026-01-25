class OverlayScreen {
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


    init(cfg) {
        this.applyConfig(cfg);
        this.createImage();
    }


    applyConfig(cfg) {
        this.overlayId = cfg.overlayId;
        this.imageSrc = cfg.imageSrc;
        this.fadeSpeed = cfg.fadeSpeed ?? 0.06;
        this.imageAlpha = cfg.imageAlpha ?? 1;
    }


    createImage() {
        this.image = new Image();
        this.image.src = this.imageSrc;
        this.image.onload = () => this.onImageLoaded();
    }


    onImageLoaded() {
        this.loaded = true;
        if (this.visible) this.draw();
    }


    show() {
        this.visible = true;
        this.fade = 0;
        this.toggleOverlay(true);
        this.startFadeLoop();
    }


    hide() {
        this.visible = false;
        this.stopFadeLoop();
        this.toggleOverlay(false);
    }


    hideSmooth(done) {
        if (!this.visible) return done?.();
        this.onFadeDone = done || null;
        this.fadeOutStep();
    }


    fadeOutStep() {
        this.fade = Math.max(0, this.fade - this.fadeSpeed);
        this.draw();
        if (this.fade > 0) return requestAnimationFrame(() => this.fadeOutStep());
        this.finishFadeOut();
    }


    finishFadeOut() {
        this.visible = false;
        const cb = this.onFadeDone;
        this.onFadeDone = null;
        cb?.();
    }



    toggleOverlay(isOpen) {
        const ov = document.getElementById(this.overlayId);
        if (!ov) return;
        ov.classList.toggle('d-none', !isOpen);
        ov.classList.toggle('d-flex', isOpen);
    }


    startFadeLoop() {
        this.stopFadeLoop();
        this.rafId = requestAnimationFrame(() => this.fadeStep());
    }


    stopFadeLoop() {
        if (!this.rafId) return;
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }


    fadeStep() {
        if (!this.visible) return;
        this.fade = Math.min(1, this.fade + this.fadeSpeed);
        this.draw();
        if (this.fade < 1) this.startFadeLoop();
    }


    draw() {
        if (!this.visible) return;
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.drawScreenImage();
        this.ctx.restore();
    }


    drawScreenImage() {
        if (!this.loaded) return;
        this.ctx.globalAlpha = this.fade * (this.imageAlpha ?? 1);
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
    }


    captureBaseFrame() {
        this.baseFrame = document.createElement('canvas');
        this.baseFrame.width = this.canvas.width;
        this.baseFrame.height = this.canvas.height;
        const bctx = this.baseFrame.getContext('2d');
        bctx.drawImage(this.canvas, 0, 0);
    }


    prepareDraw() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }


    drawBaseFrame() {
        if (!this.baseFrame) return;
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.baseFrame, 0, 0);
    }


    drawWithBaseFrame() {
        if (!this.visible) return;
        this.prepareDraw();
        this.drawBaseFrame();
        this.drawScreenImage();
        this.ctx.restore();
    }
}