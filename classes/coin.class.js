/**
 * Represents a collectible coin in the world.
 * Handles its own animation frames (no intervals).
 * @extends MovableObject
 */
class Coin extends MovableObject {
    collected = false;
    coinFrames = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png'
    ];
    frameMs = 180;
    lastFrameAt = 0;
    cycleMs = 520;
    animStartAt = 0;



    /**
     * Creates a coin at the given position.
     * @param {number} x - The x-position of the coin.
     * @param {number} y - The y-position of the coin.
     */
    constructor(x, y) {
        super();
        this.initCoinImages();
        this.setPosition(x, y);
        this.initSize();
        this.initFrameBounds();
        this.initAnimState();
    }


    /**
     * Loads the first coin frame and caches all animation frames.
     * @returns {void}
     */
    initCoinImages() {
        this.loadImage(this.coinFrames[0]);
        this.loadImages(this.coinFrames);
    }


    /**
     * Sets the coin position.
     * @param {number} x
     * @param {number} y
     * @returns {void}
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }


    /**
     * Initializes the coin size.
     * @returns {void}
     */
    initSize() {
        this.height = 200;
        this.width = 200;
    }


    /**
     * Initializes the collision/debug frame bounds.
     * @returns {void}
     */
    initFrameBounds() {
        this.frameOffsetX = 70;
        this.frameWidth = this.width - 140;
        this.frameOffsetY = 70;
        this.frameHeight = this.height - 140;
    }


    /**
     * Initializes animation state.
     * @returns {void}
     */
    initAnimState() {
        this.currentImage = 0;
        // this.animStartAt = performance.now();
        this.animStartAt = performance.now() - this.getRandomPhaseOffset();
    }


    /**
 * Creates a random phase offset so coins don't blink in sync.
 * @returns {number}
 */
    getRandomPhaseOffset() {
        return Math.random() * (this.cycleMs || 1);
    }


    /**
     * Updates the coin animation based on elapsed time.
     * @param {number} now - Performance timestamp.
     * @returns {void}
     */
    updateAnimation(now) {
        if (window.isGamePaused) { this.wasPaused = true; return; }
        if (this.wasPaused) this.resetAnimStart(now);
        if (!this.animStartAt) this.animStartAt = now;
        this.animT = this.getCycleProgress(now);
    }


    /**
 * Resets animation anchor after pause to avoid phase jumps.
 * @param {number} now
 * @returns {void}
 */
    resetAnimStart(now) {
        this.animStartAt = now;
        this.wasPaused = false;
    }


    /**
     * Draws the coin fully opaque using eased frame selection.
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    draw(ctx) {
        const img = this.getOpaqueFrameImage();
        if (!img) return;
        ctx.drawImage(img, 0, 0, this.width, this.height);
    }


    /**
 * Returns the current animation frame without transparency.
 * Uses eased blend value to decide frame switch timing.
 * @returns {HTMLImageElement|null}
 */
    getOpaqueFrameImage() {
        const t = this.getEasedBlendT();
        const idx = t < 0.5 ? 0 : 1;
        return this.getFrameImage(idx);
    }


    /**
     * Returns progress in range [0..1] for the current cycle.
     * @param {number} now
     * @returns {number}
     */
    getCycleProgress(now) {
        const elapsed = now - this.animStartAt;
        const p = (elapsed % this.cycleMs) / this.cycleMs;
        return Math.max(0, Math.min(1, p));
    }


    /**
     * Maps cycle progress to a back-and-forth blend value.
     * 0..0.5 => 0..1, 0.5..1 => 1..0
     * @returns {number}
     */
    getBlendT() {
        const p = this.animT ?? 0;
        return p < 0.5 ? (p * 2) : (1 - (p - 0.5) * 2);
    }


    /**
     * Applies ease-in-out to blend value for smoother motion.
     * @returns {number}
     */
    getEasedBlendT() {
        const t = this.getBlendT();
        return t * t * (3 - 2 * t);
    }


    /**
     * Returns cached image for a given frame index.
     * @param {number} idx
     * @returns {HTMLImageElement|null}
     */
    getFrameImage(idx) {
        const path = this.coinFrames[idx];
        return this.imageCache?.[path] || null;
    }
}