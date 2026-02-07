/**
 * Checks all collision types.
 */
World.prototype.checkCollisions = function() {
    this.collisionWithChicken();
    this.collisionWithCollectable(this.coins, 'coin', this.updateCoinStatusBar);
    this.collisionWithCollectable(this.bottles, 'bottle', this.updateBottleStatusBar);
    this.checkBottleHitsEnemies();
}


/**
 * Checks collisions between the character and enemies.
 */
World.prototype.collisionWithChicken = function() {
    this.level.enemies.forEach(enemy => this.handleEnemyCollision(enemy));
}


/**
 * Handles collision logic with a specific enemy.
 * @param {*} enemy
 */
World.prototype.handleEnemyCollision = function(enemy) {
    if (this.shouldSkipEnemyCollision(enemy)) return;
    if (!this.isEndbossAwareCollision(this.character, enemy)) return;
    if (this.handleEndbossAttackCollision(enemy)) return;
    if (this.handleStompCollision(enemy)) return;
    if (this.isEndbossBodyHitBlocked(enemy)) return;
    this.applyCharacterHit(enemy, 4000);
}


/**
 * Determines whether enemy collision should be skipped.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.shouldSkipEnemyCollision = function(enemy) {
    return enemy.isDead() || this.character.isDead();
}


/**
 * Handles collisions during an endboss attack.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.handleEndbossAttackCollision = function(enemy) {
    if (!(enemy instanceof Endboss)) return false;
    if (!enemy.isAttackAnim()) return false;
    if (enemy.hasHitInCurrentAttack) return true;
    const nowPerf = performance.now();
    if (nowPerf < (enemy.attackHitAllowedAt || 0)) return true;
    this.applyAttackKnockback(enemy);
    this.applyCharacterHit(enemy, 600);
    this.adjustEndbossAtLeftEdge(enemy);
    enemy.resolveAttackContact?.(this.character);
    enemy.hasHitInCurrentAttack = true;
    return true;
}


/**
 * Applies knockback to the character after attack.
 */
World.prototype.applyAttackKnockback = function() {
    this.character.speedY = 15;
    this.keepCharacterInsideBounds();
}


/**
 * Handles stomp collisions.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.handleStompCollision = function(enemy) {
    if (!this.isChickenEnemy(enemy)) return false;
    if (!this.character.isCollidingFromTop(enemy)) return false;
    this.killChicken(enemy);
    return true;
}


/**
 * Determines whether an enemy is a chicken type.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.isChickenEnemy = function(enemy) {
    return enemy instanceof Chicken || enemy instanceof SmallChicken;
}


/**
 * Kills a chicken enemy.
 * @param {*} enemy
 */
World.prototype.killChicken = function(enemy) {
    enemy.energy = 0;
    enemy.lastHit = Date.now();
    this.playEffectSound(this.sounds.chickenDead);
}


/**
 * Checks whether endboss body hits are temporarily blocked.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.isEndbossBodyHitBlocked = function(enemy) {
    if (!(enemy instanceof Endboss)) return false;
    return performance.now() < (enemy.postAlertCooldownUntil || 0);
}


/**
 * Applies damage to the character with cooldown.
 * @param {*} enemy
 * @param {number} cooldownMs
 */
World.prototype.applyCharacterHit = function(enemy, cooldownMs) {
    const now = Date.now();
    if (enemy.lastHitOnCharacter && now - enemy.lastHitOnCharacter <= cooldownMs) return;
    this.character.hit(enemy);
    enemy.lastHitOnCharacter = now;
    this.updateHealthStatusBar();
}


/**
 * Ensures the character stays within level bounds.
 */
World.prototype.keepCharacterInsideBounds = function() {
    const c = this.character;
    if (!c) return;
    const minX = typeof c.minX === 'number' ? c.minX : -Infinity;
    const level = this.level;
    const maxX = level?.level_end_x ?? Infinity;
    if (c.x < minX) c.x = minX;
    if (c.x > maxX) c.x = maxX;
}


/**
 * Adjusts endboss position when colliding at left edge.
 * @param {*} enemy
 */
World.prototype.adjustEndbossAtLeftEdge = function(enemy) {
    const char = this.character;
    if (!char || !(enemy instanceof Endboss)) return;
    const charRight = char.x + (char.frameWidth || char.width);
    const gap = 30;
    const desiredBossX = charRight + gap;
    if (enemy.x < desiredBossX) enemy.x = desiredBossX;
}


/**
 * Handles collisions with collectible items.
 * @param {Array} array
 * @param {string} propertyName
 * @param {Function} updateStatusBarCallback
 */
World.prototype.collisionWithCollectable = function(array, propertyName, updateStatusBarCallback) {
    const index = array.findIndex(item => this.character.isColliding(item));
    if (index !== -1) {
        this.character[propertyName] += 20;
        if (this.character[propertyName] > 100) this.character[propertyName] = 100;
        updateStatusBarCallback.call(this);
        array.splice(index, 1);
        if (propertyName === 'coin') this.playEffectSound(this.sounds.collectedCoin);
        if (propertyName === 'bottle') this.playEffectSound(this.sounds.collectedBottle);
    }
}


/**
 * Checks collisions between bottles and enemies.
 */
World.prototype.checkBottleHitsEnemies = function() {
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
World.prototype.hitEndbossWithBottle = function(enemy, bottle, now) {
    this.stopEndbossActionSounds();
    const cd = 250;
    enemy.stun(700);
    if (!enemy.lastHit || now - enemy.lastHit > cd) {
        enemy.hit();
        if (!enemy.isDead()) enemy.hurtFlash();
        enemy.lastHit = now;
        this.updateEndbossStatusBar(enemy);
    }
    bottle.splash();
}


/**
 * Kills a chicken enemy using a bottle.
 * @param {*} enemy
 * @param {*} bottle
 */
World.prototype.killChickenWithBottle = function(enemy, bottle) {
    enemy.energy = 0;
    enemy.lastHit = new Date().getTime();
    this.playEffectSound(this.sounds.chickenDead);
    bottle.splash();
}


/**
 * Checks bottles hitting the ground.
 */
World.prototype.checkBottleOnGround = function() {
    this.throwableObject.forEach((bottle) => {
        if (!bottle.isSplashed && bottle.isOnGround()) {
            bottle.splash();
        }
    });
}


/**
 * Performs collision check with endboss awareness.
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
World.prototype.isEndbossAwareCollision = function(a, b) {
    if (a instanceof Endboss) return a.isColliding(b);
    if (b instanceof Endboss) return b.isColliding(a);
    return a.isColliding(b);
}