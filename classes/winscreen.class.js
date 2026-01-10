class Winscreen {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.image = new Image();
        this.image.src = 'img/You won, you lost/You Win A.png'; // ggf. anpassen
        this.loaded = false;
        this.visible = false;
        this.overlayAlpha = 0.35;
        this.image.onload = () => this.onImageLoaded();
    }

    onImageLoaded() {
        this.loaded = true;
        if (this.visible) this.draw();
    }

    show() {
        this.visible = true;
        this.draw();
        this.toggleOverlay('winOverlay', true);
    }

    hide() {
        this.visible = false;
        this.toggleOverlay('winOverlay', false);
    }

    toggleOverlay(id, isOpen) {
        const ov = document.getElementById(id);
        if (!ov) return;
        ov.classList.toggle('d-none', !isOpen);
        ov.classList.toggle('d-flex', isOpen);
    }

    draw() {
        if (!this.visible) return;
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.drawDarkLayer();
        this.drawWinImage();
        this.ctx.restore();
    }

    drawDarkLayer() {
        this.ctx.globalAlpha = this.overlayAlpha;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
    }

    drawWinImage() {
        if (!this.loaded) return;
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    }
}
