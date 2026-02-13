/**
 * Fits the canvas pixel size to its CSS size and applies viewport transform.
 *
 * @returns {void}
 */
function fitCanvasToCssSize() {
    const canvasData = getCanvasData();
    if (!canvasData) return;
    const metrics = getCanvasMetrics(canvasData.c);
    if (!metrics) return;
    const didResize = syncCanvasPixelSize(canvasData.c, metrics.pxW, metrics.pxH);
    const transform = calcViewportTransform(metrics.pxW, metrics.pxH);
    applyViewportTransform(canvasData.ctx, transform);
    redrawAfterCanvasResize(didResize);
}



/**
 * Returns canvas element and its 2D context.
 *
 * @returns {{c: HTMLCanvasElement, ctx: CanvasRenderingContext2D}|null}
 */
function getCanvasData() {
    const c = document.getElementById('canvas');
    if (!c) return null;
    const ctx = c.getContext('2d');
    return { c, ctx };
}


/**
 * Calculates canvas pixel metrics based on CSS size and device pixel ratio.
 *
 * @param {HTMLCanvasElement} c
 * @returns {{pxW: number, pxH: number}|null}
 */
function getCanvasMetrics(c) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = Math.round(c.clientWidth);
    const cssH = Math.round(c.clientHeight);
    if (!cssW || !cssH) return null;
    return { pxW: cssW * dpr, pxH: cssH * dpr };
}


/**
 * Synchronizes the canvas internal pixel size.
 *
 * @param {HTMLCanvasElement} c
 * @param {number} pxW
 * @param {number} pxH
 * @returns {boolean} True if the canvas size changed.
 */
function syncCanvasPixelSize(c, pxW, pxH) {
    const EPS = 2;
    const wDiff = Math.abs(c.width - pxW);
    const hDiff = Math.abs(c.height - pxH);
    const didChange = (wDiff >= EPS) || (hDiff >= EPS);
    if (!didChange) return false;
    c.width = pxW;
    c.height = pxH;
    return true;
}


/**
 * Calculates scale and offsets for the viewport transform.
 *
 * @param {number} pxW
 * @param {number} pxH
 * @returns {{scale: number, offX: number, offY: number}}
 */
function calcViewportTransform(pxW, pxH) {
    const BASE_W = 720, BASE_H = 480;
    const scale = Math.min(pxW / BASE_W, pxH / BASE_H);
    const offX = (pxW - BASE_W * scale) / 2;
    const offY = (pxH - BASE_H * scale) / 2;
    return { scale, offX, offY };
}


/**
 * Applies the viewport transform to the canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{scale: number, offX: number, offY: number}} t
 * @returns {void}
 */
function applyViewportTransform(ctx, t) {
    window.viewOffsetX = t.offX / t.scale;
    ctx.setTransform(t.scale, 0, 0, t.scale, t.offX, t.offY);
    ctx.imageSmoothingEnabled = true;
}


/**
 * Redraws the current world state immediately after a canvas resize to prevent black flicker.
 *
 * @param {boolean} didResize
 * @returns {void}
 */
function redrawAfterCanvasResize(didResize) {
    if (!didResize) return;
    if (!world || !world.drawStaticFrame) return;
    world.drawStaticFrame();
}


/**
 * Handles viewport change events using requestAnimationFrame throttling.
 *
 * @returns {void}
 */
function handleViewportChange() {
    if (isViewportRafRunning()) return;
    scheduleViewportRaf();
}


/**
 * Checks whether a viewport RAF task is already scheduled.
 *
 * @returns {boolean}
 */
function isViewportRafRunning() {
    return Boolean(_viewportRaf);
}


/**
 * Schedules a viewport update via requestAnimationFrame.
 *
 * @returns {void}
 */
function scheduleViewportRaf() {
    _viewportRaf = requestAnimationFrame(() => {
        runViewportRafTasks();
        clearViewportRaf();
    });
}


/**
 * Executes all viewport-related update tasks.
 *
 * @returns {void}
 */
function runViewportRafTasks() {
    fitCanvasToCssSize();
    refreshVisibleScreens();
    updateMobileControlsVisibility();
    checkOrientation();
}


/**
 * Refreshes all visible overlay screens after viewport changes.
 *
 * @returns {void}
 */
function refreshVisibleScreens() {
    if (!world) return;
    refreshScreenIfVisible(world.endscreen);
    refreshScreenIfVisible(world.winscreen);
}


/**
 * Refreshes a single overlay screen if it is visible.
 *
 * @param {OverlayScreen} screen
 * @returns {void}
 */
function refreshScreenIfVisible(screen) {
    if (!screen?.visible) return;
    screen.ensureBaseFrameMatchesCanvas?.();
    screen.draw?.();
}


/**
 * Clears the viewport RAF state.
 *
 * @returns {void}
 */
function clearViewportRaf() {
    _viewportRaf = null;
}


/**
 * Initializes the HiDPI canvas setup.
 *
 * @returns {void}
 */
function setupHiDPICanvas() {
    fitCanvasToCssSize();
}