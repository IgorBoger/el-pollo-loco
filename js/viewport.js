function fitCanvasToCssSize() {
    const canvasData = getCanvasData();
    if (!canvasData) return;
    const metrics = getCanvasMetrics(canvasData.c);
    if (!metrics) return;
    syncCanvasPixelSize(canvasData.c, metrics.pxW, metrics.pxH);
    const transform = calcViewportTransform(metrics.pxW, metrics.pxH);
    applyViewportTransform(canvasData.ctx, transform);
}


function getCanvasData() {
    const c = document.getElementById('canvas');
    if (!c) return null;
    const ctx = c.getContext('2d');
    return { c, ctx };
}


function getCanvasMetrics(c) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = Math.round(c.clientWidth);
    const cssH = Math.round(c.clientHeight);
    if (!cssW || !cssH) return null;
    return { pxW: cssW * dpr, pxH: cssH * dpr };
}


function syncCanvasPixelSize(c, pxW, pxH) {
    if (c.width !== pxW || c.height !== pxH) {
        c.width = pxW;
        c.height = pxH;
    }
}


function calcViewportTransform(pxW, pxH) {
    const BASE_W = 720, BASE_H = 480;
    const scale = Math.min(pxW / BASE_W, pxH / BASE_H);
    const offX = (pxW - BASE_W * scale) / 2;
    const offY = (pxH - BASE_H * scale) / 2;
    return { scale, offX, offY };
}


function applyViewportTransform(ctx, t) {
    window.viewOffsetX = t.offX / t.scale;
    ctx.setTransform(t.scale, 0, 0, t.scale, t.offX, t.offY);
    ctx.imageSmoothingEnabled = true;
}


function handleViewportChange() {
    if (isViewportRafRunning()) return;
    scheduleViewportRaf();
}


function isViewportRafRunning() {
    return Boolean(_viewportRaf);
}


function scheduleViewportRaf() {
    _viewportRaf = requestAnimationFrame(() => {
        runViewportRafTasks();
        clearViewportRaf();
    });
}


function runViewportRafTasks() {
    fitCanvasToCssSize();
    drawEndscreenIfNeeded();
    updateMobileControlsVisibility();
    checkOrientation();
}


function drawEndscreenIfNeeded() {
    if (!shouldDrawEndscreen()) return;
    drawEndscreenFrame();
}


function shouldDrawEndscreen() {
    return Boolean(world
        && world.character?.isDead?.()
        && world.endscreen?.visible);
}


function drawEndscreenFrame() {
    world.drawStaticFrame?.();
    world.endscreen.draw();
}


function clearViewportRaf() {
    _viewportRaf = null;
}


function setupHiDPICanvas() {
    fitCanvasToCssSize();
}