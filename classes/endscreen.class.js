class Endscreen {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.width = 720;
        this.height = 480;
        this.x = 0;
        this.y = 0;
        this.image = new Image();
        this.image.src = 'img/9_intro_outro_screens/game_over/game over.png';
        this.loaded = false;
        this.image.onload = () => {
            this.loaded = true;
            if (this.visible) this.draw();
        };
        this.visible = false;
        this.overlayAlpha = 0.35;
    }

    show() {
        this.visible = true;
        this.draw();
        const ov = document.getElementById('gameOverOverlay');
        ov?.classList.remove('d-none');
        ov?.classList.add('d-flex');
    }


    draw() {
        if (!this.visible) return;
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalAlpha = this.overlayAlpha;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.loaded) {
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        }
        this.ctx.restore();
    }



    hide() {
        this.visible = false;
        const ov = document.getElementById('gameOverOverlay');
        ov?.classList.remove('d-flex');
        ov?.classList.add('d-none');
    }
}
