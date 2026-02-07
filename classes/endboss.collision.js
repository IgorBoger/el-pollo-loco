/**
 * Builds the composite hit rectangles for endboss collision.
 * @returns {{x:number, y:number, w:number, h:number}[]}
 */
Endboss.prototype.getEndbossHitRects = function () {
    const r = this.getMainFrameRect();
    const split = r.h * 0.5;
    const cut = r.w / 3;
    const cm2 = 80;
    const baseX = r.x + cut;
    const feetY = r.y + r.h - cm2;
    const rects = [this.getTopRect(r, split),
    this.getMiddleRect(r, split, baseX, cm2),
    this.getFootRect(baseX, feetY, cm2)];
    return this.maybeMirrorRects(rects, r);
};


/**
 * Gets the main frame rect in world coordinates.
 * @returns {{x:number, y:number, w:number, h:number}}
 */
Endboss.prototype.getMainFrameRect = function () {
    const x = this.x + (this.frameOffsetX || 0);
    const y = this.y + (this.frameOffsetY || 0);
    const w = this.frameWidth || this.width;
    const h = this.frameHeight || this.height;
    return { x, y, w, h };
};


/**
 * Returns a top hit rect based on a split height.
 * @param {{x:number, y:number, w:number, h:number}} r
 * @param {number} split
 * @returns {{x:number, y:number, w:number, h:number}}
 */
Endboss.prototype.getTopRect = function (r, split) {
    return { x: r.x, y: r.y, w: r.w, h: split };
};


/**
 * Returns a middle hit rect based on split and cut parameters.
 * @param {{x:number, y:number, w:number, h:number}} r
 * @param {number} split
 * @param {number} baseX
 * @param {number} cm2
 * @returns {{x:number, y:number, w:number, h:number}}
 */
Endboss.prototype.getMiddleRect = function (r, split, baseX, cm2) {
    const leftExtra = 70;
    const rightCut = 40;
    return { x: baseX - leftExtra, y: r.y + split, w: (r.w - (baseX - r.x)) + leftExtra - rightCut, h: r.h - split - cm2 };
};


/**
 * Returns a foot hit rect.
 * @param {number} baseX
 * @param {number} feetY
 * @param {number} cm2
 * @returns {{x:number, y:number, w:number, h:number}}
 */
Endboss.prototype.getFootRect = function (baseX, feetY, cm2) {
    const footExtraRight = 20;
    return { x: baseX, y: feetY, w: cm2 + footExtraRight, h: cm2 };
};


/**
 * Mirrors rects when facing the opposite direction.
 * @param {{x:number, y:number, w:number, h:number}[]} rects
 * @param {{x:number, y:number, w:number, h:number}} frame
 * @returns {{x:number, y:number, w:number, h:number}[]}
 */
Endboss.prototype.maybeMirrorRects = function (rects, frame) {
    if (!this.otherDirection) return rects;
    return rects.map(r => this.mirrorRectX(r, frame));
};


/**
 * Mirrors a rect horizontally within a frame.
 * @param {{x:number, y:number, w:number, h:number}} rect
 * @param {{x:number, y:number, w:number, h:number}} frame
 * @returns {{x:number, y:number, w:number, h:number}}
 */
Endboss.prototype.mirrorRectX = function (rect, frame) {
    const relX = rect.x - frame.x;
    const x = frame.x + (frame.w - relX - rect.w);
    return { ...rect, x };
};


/**
 * Resolves attack contact with the character.
 * @param {object} character
 */
Endboss.prototype.resolveAttackContact = function (character) {
    if (!character) return;
    const dir = this.getAttackDir();
    this.snapBossToChar(character, dir);
    this.applyAttackRecoil(dir);
    this.currentSpeed = 0;
};


/**
 * Gets attack direction based on target speed sign.
 * @returns {number}
 */
Endboss.prototype.getAttackDir = function () {
    return this.targetSpeed >= 0 ? 1 : -1;
};


/**
 * Snaps boss position next to the character for contact resolution.
 * @param {object} character
 * @param {number} dir
 */
Endboss.prototype.snapBossToChar = function (character, dir) {
    const ox = this.frameOffsetX || 0;
    const fw = this.frameWidth || this.width;
    const c = this.getMoFrameRect(character);
    this.x = dir > 0 ? (c.x - ox - fw) : (c.x + c.w - ox);
};


/**
 * Gets a movable object's frame rect in world coordinates.
 * @param {object} mo
 * @returns {{x:number, y:number, w:number, h:number}}
 */
Endboss.prototype.getMoFrameRect = function (mo) {
    const x = mo.x + (mo.frameOffsetX || 0);
    const y = mo.y + (mo.frameOffsetY || 0);
    const w = mo.frameWidth || mo.width;
    const h = mo.frameHeight || mo.height;
    return { x, y, w, h };
};


/**
 * Applies recoil movement after attack contact.
 * @param {number} dir
 */
Endboss.prototype.applyAttackRecoil = function (dir) {
    const recoilPx = this.attackRecoilPx || 10;
    this.x -= recoilPx * dir;
};


/**
 * Collision check with another movable object.
 * @param {object} mo
 * @returns {boolean}
 */
Endboss.prototype.isColliding = function (mo) {
    if (this.collected || mo.collected) return false;
    const b = this.getMoFrameRect(mo);
    return this.getEndbossHitRects().some(r => this.rectsOverlap(r, b));
};


/**
 * Checks if two rectangles overlap.
 * @param {{x:number, y:number, w:number, h:number}} a
 * @param {{x:number, y:number, w:number, h:number}} b
 * @returns {boolean}
 */
Endboss.prototype.rectsOverlap = function (a, b) {
    return a.x + a.w > b.x &&
        a.x < b.x + b.w &&
        a.y + a.h > b.y &&
        a.y < b.y + b.h;
};


/**
 * Draws debug hitboxes for the endboss when enabled.
 * @param {CanvasRenderingContext2D} ctx
 */
Endboss.prototype.drawFrame = function (ctx) {
    if (!window.debugHitboxes) return;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'blue';
    this.getEndbossHitRects().forEach(r => {
        ctx.strokeRect(r.x - this.x, r.y - this.y, r.w, r.h);
    });
};