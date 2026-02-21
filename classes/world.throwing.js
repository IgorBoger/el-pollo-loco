/**
 * Handles bottle throwing input.
 */
World.prototype.checkThrowObject = function () {
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
World.prototype.canThrowBottle = function (now) {
    if (this.isControlsLocked()) return false;
    return this.keyBaord.THROW &&
        this.character.bottle > 0 &&
        now - this.lastBottleThrow > 800;
}


/**
 * Returns the throw direction based on character facing.
 * @returns {number}
 */
World.prototype.getThrowDirection = function () {
    return this.character.otherDirection ? -1 : 1;
}


/**
 * Creates a throwable bottle instance.
 * @param {number} direction
 * @returns {ThrowableObject}
 */
World.prototype.createThrowableBottle = function (direction) {
    const pos = this.getBottleSpawnPosition(direction);
    return new ThrowableObject(pos.x, pos.y, this, direction);
}


/**
 * Resolves bottle spawn position.
 * @param {number} direction
 * @returns {{x:number, y:number}}
 */
World.prototype.getBottleSpawnPosition = function (direction) {
    if (this.isCharacterInAir()) return this.getAirBottlePosition(direction);
    return this.getGroundBottlePosition(direction);
}


/**
 * Checks whether the character is in the air.
 * @returns {boolean}
 */
World.prototype.isCharacterInAir = function () {
    return this.character.y < 180;
}


/**
 * Gets bottle spawn position while in air.
 * @param {number} direction
 * @returns {{x:number, y:number}}
 */
World.prototype.getAirBottlePosition = function (direction) {
    const offsetX = direction * 30;
    return { x: this.character.x + offsetX, y: this.character.y + 140 };
}


/**
 * Gets bottle spawn position while on ground.
 * @param {number} direction
 * @returns {{x:number, y:number}}
 */
World.prototype.getGroundBottlePosition = function (direction) {
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
World.prototype.getGroundLeftBottlePosition = function (y, direction) {
    const offsetX = direction * 30;
    return { x: this.character.x + offsetX, y };
}


/**
 * Calculates ground spawn y-position.
 * @returns {number}
 */
World.prototype.getGroundSpawnY = function () {
    const baseY = typeof this.character.minY === 'number'
        ? this.character.minY
        : this.character.y;
    return baseY + 140;
}


/**
 * Adds a bottle to the world.
 * @param {ThrowableObject} bottle
 */
World.prototype.addBottleToWorld = function (bottle) {
    this.throwableObject.push(bottle);
}


/**
 * Consumes a bottle and updates state.
 * @param {number} now
 */
World.prototype.consumeBottleAndUpdate = function (now) {
    this.character.bottle -= 5;
    if (this.character.bottle < 0) this.character.bottle = 0;
    this.updateBottleStatusBar();
    this.lastBottleThrow = now;
}


/**
 * Checks collisions between bottles and enemies.
 */
World.prototype.checkBottleHitsEnemies = function () {
    const now = new Date().getTime();
    this.level.enemies.forEach(enemy => {
        if (enemy.isDead()) return;
        this.throwableObject.forEach(bottle => {
            if (bottle.isSplashed) return;
            if (!this.isEndbossAwareCollision(bottle, enemy)) return;
            if (enemy instanceof Endboss) return this.hitEndbossWithBottle(enemy, bottle, now);
            if (this.isChickenEnemy(enemy)) return this.killChickenWithBottle(enemy, bottle);
        });
    });
}


/**
 * Handles endboss hit by bottle.
 * @param {*} enemy
 * @param {*} bottle
 * @param {number} now
 */
World.prototype.hitEndbossWithBottle = function (enemy, bottle, now) {
    this.stopEndbossActionSounds();
    if (!this.canDamageEndboss(enemy, now)) return bottle.splash();
    this.applyEndbossBottleDamage(enemy, bottle, now);
};


/**
 * Returns whether the endboss can take damage from a bottle right now.
 * @param {*} enemy
 * @param {number} now
 * @returns {boolean}
 */
World.prototype.canDamageEndboss = function (enemy, now) {
    const cd = this.getEndbossBottleCooldownMs();
    return !enemy.lastHit || (now - enemy.lastHit > cd);
};


/**
 * Returns the cooldown (ms) for bottle damage to the endboss.
 * @returns {number}
 */
World.prototype.getEndbossBottleCooldownMs = function () {
    return 2000;
};


/**
 * Applies bottle damage + reaction to the endboss.
 * @param {*} enemy
 * @param {*} bottle
 * @param {number} now
 * @returns {void}
 */
World.prototype.applyEndbossBottleDamage = function (enemy, bottle, now) {
    enemy.stun(enemy.getBottleStunMs?.() ?? 700);
    const didDamage = this.tryApplyStackedEndbossDamage(enemy);
    enemy.lastHit = now;
    if (didDamage) this.updateEndbossStatusBar(enemy);
    bottle.splash();
};


/**
 * Applies real endboss damage only when enough bottle hits were stacked.
 * @param {Endboss} enemy
 * @returns {boolean}
 */
World.prototype.tryApplyStackedEndbossDamage = function (enemy) {
    if (!enemy.shouldApplyDamageNow?.()) return false;
    enemy.hit();
    if (!enemy.isDead()) enemy.hurtFlash();
    return true;
};


/**
 * Kills a chicken enemy using a bottle.
 * @param {*} enemy
 * @param {*} bottle
 */
World.prototype.killChickenWithBottle = function (enemy, bottle) {
    enemy.energy = 0;
    enemy.lastHit = new Date().getTime();
    this.playEffectSound(this.sounds.chickenDead);
    bottle.splash();
}


/**
 * Checks bottles hitting the ground.
 */
World.prototype.checkBottleOnGround = function () {
    this.throwableObject.forEach((bottle) => {
        if (!bottle.isSplashed && bottle.isOnGround()) bottle.splash();
    });
}