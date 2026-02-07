/**
 * Handles bottle throwing input.
 */
World.prototype.checkThrowObject = function() {
    const now = Date.now();
    if (!this.canThrowBottle(now)) return;
    const direction = this.getThrowDirection();
    const bottle = this.createThrowableBottle(direction);
    this.addBottleToWorld(bottle);
    this.consumeBottleAndUpdate(now);
}


/**
 * Determines whether a bottle can be thrown.
 * @param {number} now
 * @returns {boolean}
 */
World.prototype.canThrowBottle = function(now) {
    return this.keyBaord.THROW &&
        this.character.bottle > 0 &&
        now - this.lastBottleThrow > 500;
}


/**
 * Returns the throw direction based on character facing.
 * @returns {number}
 */
World.prototype.getThrowDirection = function() {
    return this.character.otherDirection ? -1 : 1;
}


/**
 * Creates a throwable bottle instance.
 * @param {number} direction
 * @returns {ThrowableObject}
 */
World.prototype.createThrowableBottle = function(direction) {
    const pos = this.getBottleSpawnPosition(direction);
    return new ThrowableObject(pos.x, pos.y, this, direction);
}


/**
 * Resolves bottle spawn position.
 * @param {number} direction
 * @returns {{x:number, y:number}}
 */
World.prototype.getBottleSpawnPosition = function(direction) {
    if (this.isCharacterInAir()) return this.getAirBottlePosition(direction);
    return this.getGroundBottlePosition(direction);
}


/**
 * Checks whether the character is in the air.
 * @returns {boolean}
 */
World.prototype.isCharacterInAir = function() {
    return this.character.y < 180;
}


/**
 * Gets bottle spawn position while in air.
 * @param {number} direction
 * @returns {{x:number, y:number}}
 */
World.prototype.getAirBottlePosition = function(direction) {
    const offsetX = direction * 30;
    return { x: this.character.x + offsetX, y: this.character.y + 140 };
}


/**
 * Gets bottle spawn position while on ground.
 * @param {number} direction
 * @returns {{x:number, y:number}}
 */
World.prototype.getGroundBottlePosition = function(direction) {
    const y = this.getGroundSpawnY();
    if (direction === -1) return this.getGroundLeftBottlePosition(y, direction);
    return { x: this.character.x + 50, y };
}


/**
 * Gets left-facing ground bottle spawn position.
 * @param {number} y
 * @param {number} direction
 * @returns {{x:number, y:number}}
 */
World.prototype.getGroundLeftBottlePosition = function(y, direction) {
    const offsetX = direction * 30;
    return { x: this.character.x + offsetX, y };
}


/**
 * Calculates ground spawn y-position.
 * @returns {number}
 */
World.prototype.getGroundSpawnY = function() {
    const baseY = typeof this.character.minY === 'number'
        ? this.character.minY
        : this.character.y;
    return baseY + 140;
}


/**
 * Adds a bottle to the world.
 * @param {ThrowableObject} bottle
 */
World.prototype.addBottleToWorld = function(bottle) {
    this.throwableObject.push(bottle);
}


/**
 * Consumes a bottle and updates state.
 * @param {number} now
 */
World.prototype.consumeBottleAndUpdate = function(now) {
    this.character.bottle -= 5;
    if (this.character.bottle < 0) this.character.bottle = 0;
    this.updateBottleStatusBar();
    this.lastBottleThrow = now;
}