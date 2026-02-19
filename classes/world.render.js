/**
 * Initializes background tiles.
 */
World.prototype.initBackground = function () {
    for (let i = -1; i < this.backgroundTileCount; i++) {
        const xPos = i * 720;
        const currentLayers = i % 2 === 0 ? this.level.layers : this.level.altLayers;
        this.addTile(xPos, currentLayers);
    }
}


/**
 * Adds a background tile at a given position.
 * @param {number} xPos
 * @param {string[]} layers
 */
World.prototype.addTile = function (xPos, layers) {
    layers.forEach(imagePath => {
        this.level.backgroundObjects.push(new BackgroundObject(imagePath, xPos));
    });
}


/**
 * Main draw loop.
 */
World.prototype.draw = function () {
    if (this.stopped) return;
    const now = performance.now();
    this.updateWorldAnimations(now);
    this.clearWorldCanvas();
    this.drawWorldObjectsWithCamera();
    this.drawStatusBars();
    this.scheduleGameOverIfDead();
    this.checkWinCondition();
    this.requestNextFrame();
}


/**
 * Clears the canvas.
 */
World.prototype.clearWorldCanvas = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}


/**
 * Draws world objects with camera translation.
 */
World.prototype.drawWorldObjectsWithCamera = function () {
    const camX = this.getSnappedCameraX();
    this.ctx.translate(camX, 0);
    this.drawWorldObjects();
    this.tryAddNextBackgroundTile();
    this.ctx.translate(-camX, 0);
}


/**
 * Returns a pixel-snapped camera x to prevent 1px seams between 720px tiles.
 * @returns {number}
 */
World.prototype.getSnappedCameraX = function () {
    return snapWorldXToDevicePixel(this.camera_x);
}


/**
 * Snaps a world-x coordinate to device pixels using the current viewport scale.
 * Prevents 1px hairline seams on Firefox/Android.
 * @param {number} worldX
 * @returns {number}
 */
function snapWorldXToDevicePixel(worldX) {
    const scale = getViewportScale();
    return Math.round(worldX * scale) / scale;
}


/**
 * Returns the current viewport scale (fallback 1).
 * @returns {number}
 */
function getViewportScale() {
    return window.viewScale || 1;
}


/**
 * Draws all world objects.
 */
World.prototype.drawWorldObjects = function () {
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
    if (!this.shouldHideCharacter()) this.addToMap(this.character);
    this.addObjectsToMap(this.coins);
    this.addObjectsToMap(this.bottles);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObject);
}


/**
 * Returns whether the character should be hidden (e.g. for endscreen capture).
 * @returns {boolean}
 */
World.prototype.shouldHideCharacter = function () {
    return !!this.hideCharacter || !this.character;
}


/**
 * Adds next background tile if needed.
 */
World.prototype.tryAddNextBackgroundTile = function () {
    if (this.character.x + this.canvas.width <= this.backgroundTileCount * 720) return;
    this.addBackgroundTile(this.backgroundTileCount);
    this.backgroundTileCount++;
}


/**
 * Draws all status bars.
 */
World.prototype.drawStatusBars = function () {
    this.addToMap(this.healthBar);
    this.addToMap(this.coinBar);
    this.addToMap(this.bottleBar);
    this.addToMap(this.endbossBar);
}


/**
 * Draws a static frame without scheduling the next render frame.
 */
World.prototype.drawStaticFrame = function () {
    const prevStopped = this.stopped;
    const prevRequest = this.requestNextFrame;
    this.requestNextFrame = function () { };
    this.stopped = false;
    this.draw();
    this.requestNextFrame = prevRequest;
    this.stopped = prevStopped;
}


/**
 * Adds a new background tile dynamically.
 * @param {number} tileIndex
 */
World.prototype.addBackgroundTile = function (tileIndex) {
    const xPos = tileIndex * 720;
    const currentLayers = tileIndex % 2 === 0 ? this.level.layers : this.level.altLayers;
    this.addTile(xPos, currentLayers);
}


/**
 * Adds multiple objects to the map.
 * @param {Array} objects
 */
World.prototype.addObjectsToMap = function (objects) {
    objects.forEach(obj => this.addToMap(obj));
}


/**
 * Draws a single object to the map.
 * @param {*} mo
 */
World.prototype.addToMap = function (mo) {
    this.ctx.save();
    this.applyBackgroundSnap(mo);
    if (mo.otherDirection) this.flipImage(mo);
    if (!mo.otherDirection) this.flipImageBack(mo);
    mo.draw(this.ctx);
    mo.drawFrame(this.ctx);
    this.ctx.restore();
}


/**
 * Snaps the drawing context to full pixels for background objects to prevent seams.
 * @param {*} mo
 */
World.prototype.applyBackgroundSnap = function (mo) {
    if (!(mo instanceof BackgroundObject)) return;
    const x = Math.round(mo.x);
    const y = Math.round(mo.y);
    this.ctx.translate(x - mo.x, y - mo.y);
}


/**
 * Flips drawing context horizontally.
 * @param {*} mo
 */
World.prototype.flipImage = function (mo) {
    this.ctx.translate(mo.x + mo.width, mo.y);
    this.ctx.scale(-1, 1);
}


/**
 * Resets context after flipping.
 * @param {*} mo
 */
World.prototype.flipImageBack = function (mo) {
    this.ctx.translate(mo.x, mo.y);
}