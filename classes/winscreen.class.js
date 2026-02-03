class Winscreen extends OverlayScreen {

    winScreenConfig = {
        overlayId: 'winOverlay',
        imageSrc: 'img/You won, you lost/You Win A.png',
        overlayAlpha: 0.4,
        overlayColor: '#000',
        imageAlpha: 1,
        fadeSpeed: 0.06
    };

    constructor(ctx, canvas) {
        super(ctx, canvas);
        this.init(this.winScreenConfig);
    }
    

    show() {
        this.captureBaseFrame();
        super.show();
    }


    draw() {
        this.drawWithBaseFrame();
    }


    drawWithBaseFrame() {
        if (!this.visible) return;
        this.prepareDraw();
        this.drawBaseFrame();
        this.drawDimBackground(this.winScreenConfig.overlayAlpha, this.winScreenConfig.overlayColor);
        this.drawScreenImage();
        this.ctx.restore();
    }


    drawDimBackground(alpha, color) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
}
