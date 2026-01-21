function fitCanvasToCssSize() {
    const c = document.getElementById('canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const BASE_W = 720, BASE_H = 480;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = Math.round(c.clientWidth);
    const cssH = Math.round(c.clientHeight);
    if (!cssW || !cssH) return;
    const pxW = cssW * dpr, pxH = cssH * dpr;
    if (c.width !== pxW || c.height !== pxH) { c.width = pxW; c.height = pxH; }
    const scale = Math.min(pxW / BASE_W, pxH / BASE_H);
    const offX = (pxW - BASE_W * scale) / 2;
    const offY = (pxH - BASE_H * scale) / 2;
    window.viewOffsetX = offX / scale;
    ctx.setTransform(scale, 0, 0, scale, offX, offY);
    ctx.imageSmoothingEnabled = true;
}


function handleViewportChange() {
    if (_viewportRaf) return;
    _viewportRaf = requestAnimationFrame(() => {
        fitCanvasToCssSize();
        if (world
            && world.character?.isDead?.()
            && world.endscreen?.visible) {
            world.drawStaticFrame?.();
            world.endscreen.draw();
        }
        updateMobileControlsVisibility();
        checkOrientation();
        _viewportRaf = null;
    });
}


function setupHiDPICanvas() {
    fitCanvasToCssSize();
}


