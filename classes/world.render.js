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
    this.ctx.translate(this.camera_x, 0);
    this.drawWorldObjects();
    this.tryAddNextBackgroundTile();
    this.ctx.translate(-this.camera_x, 0);
}


/**
 * Draws all world objects.
 */
World.prototype.drawWorldObjects = function () {
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.coins);
    this.addObjectsToMap(this.bottles);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObject);
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
 * Draws a static frame without game loop.
 */
World.prototype.drawStaticFrame = function () {
    this.stopped = false;
    this.draw();
    this.stopped = true;
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
    if (mo.otherDirection) this.flipImage(mo);
    if (!mo.otherDirection) this.flipImageBack(mo);
    mo.draw(this.ctx);
    mo.drawFrame(this.ctx);
    this.ctx.restore();
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