/**
 * Checks all collision types.
 */
World.prototype.checkCollisions = function () {
    this.collisionWithChicken();
    this.collisionWithCollectable(this.coins, 'coin', this.updateCoinStatusBar);
    this.collisionWithCollectable(this.bottles, 'bottle', this.updateBottleStatusBar);
    this.checkBottleHitsEnemies();
}


/**
 * Checks collisions between the character and enemies.
 */
World.prototype.collisionWithChicken = function () {
    this.level.enemies.forEach(enemy => this.handleEnemyCollision(enemy));
}


/**
 * Handles collision logic with a specific enemy.
 * @param {*} enemy
 */
World.prototype.handleEnemyCollision = function (enemy) {
    if (this.shouldSkipEnemyCollision(enemy)) return;
    if (!this.isEndbossAwareCollision(this.character, enemy)) return;
    if (this.handleEndbossAttackCollision(enemy)) return;
    if (this.handleEndbossBodyCollision(enemy)) return;
    if (this.handleStompCollision(enemy)) return;
    if (this.isEndbossBodyHitBlocked(enemy)) return;
    this.applyCharacterHit(enemy, this.cooldownMs);
}


/**
 * Handles endboss body collision (not attack).
 * Pushes character back and blocks right movement shortly.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.handleEndbossBodyCollision = function (enemy) {
    if (!this.isEndboss(enemy)) return false;
    if (this.isEndbossInAttack(enemy)) return false;
    this.applyEndbossBodyBarrier(enemy);
    if (this.isEndbossBodyHitBlocked(enemy)) return true;
    this.applyCharacterHit(enemy, this.cooldownMs);
    return true;
};


/**
 * Checks whether enemy is an endboss.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.isEndboss = function (enemy) {
    return enemy instanceof Endboss;
};


/**
 * Checks whether endboss is currently attacking (then attack handler should manage it).
 * @param {Endboss} enemy
 * @returns {boolean}
 */
World.prototype.isEndbossInAttack = function (enemy) {
    return !!enemy.isAttackAnim?.();
};


/**
 * Applies body barrier behavior: pushback + optional right block + small hop.
 * @param {Endboss} enemy
 * @returns {void}
 */
World.prototype.applyEndbossBodyBarrier = function (enemy) {
    const pushLeft = this.shouldPushLeftOnBarrier(enemy);
    this.pushCharacterBackBy(pushLeft, 10);
    this.character.suppressAirAnimation(400);
    this.blockRightOnBarrier(this.cooldownMs);
    this.applySmallBarrierHop(10);
    this.keepCharacterInsideBounds();
};


/**
 * Decides push direction based on current input (more reliable than enemy-side checks).
 * @param {Endboss} enemy
 * @returns {boolean} True = push left, false = push right
 */
World.prototype.shouldPushLeftOnBarrier = function (enemy) {
    if (this.isRightPressedOnly()) return true;
    if (this.isLeftPressedOnly()) return false;
    return this.isCharacterLeftOfBossX(enemy);
};


/**
 * Checks if only RIGHT is pressed.
 * @returns {boolean}
 */
World.prototype.isRightPressedOnly = function () {
    return !!this.character?.world?.keyBaord?.RIGHT && !this.character?.world?.keyBaord?.LEFT;
};


/**
 * Checks if only LEFT is pressed.
 * @returns {boolean}
 */
World.prototype.isLeftPressedOnly = function () {
    return !!this.character?.world?.keyBaord?.LEFT && !this.character?.world?.keyBaord?.RIGHT;
};


/**
 * Fallback: compares x positions when no direction key is pressed.
 * @param {Endboss} enemy
 * @returns {boolean}
 */
World.prototype.isCharacterLeftOfBossX = function (enemy) {
    return this.character.x < enemy.x;
};


/**
 * Pushes the character back on x-axis.
 * @param {boolean} pushLeft
 * @param {number} px
 * @returns {void}
 */
World.prototype.pushCharacterBackBy = function (pushLeft, px) {
    this.character.x += pushLeft ? -px : px;
};


/**
 * Locks RIGHT input for a short time after endboss body contact.
 * RIGHT stays false until the user presses again after the lock expires.
 * @param {number} ms
 * @returns {void}
 */
World.prototype.blockRightOnBarrier = function (ms) {
    this.lockRightInput(ms);
};


/**
 * Sets RIGHT to false and stores a lock timestamp on the keyboard.
 * @param {number} ms
 * @returns {void}
 */
World.prototype.lockRightInput = function (ms) {
    this.keyBaord.RIGHT = false;
    this.keyBaord.rightLockedUntil = performance.now() + ms;
};


/**
 * Applies a small hop for feedback (optional).
 * @param {number} speedY
 * @returns {void}
 */
World.prototype.applySmallBarrierHop = function (speedY) {
    this.character.speedY = Math.max(this.character.speedY, speedY);
};


/**
 * Determines whether enemy collision should be skipped.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.shouldSkipEnemyCollision = function (enemy) {
    return enemy.isDead() || this.character.isDead();
}


/**
 * Handles collisions during an endboss attack.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.handleEndbossAttackCollision = function (enemy) {
    if (!(enemy instanceof Endboss)) return false;
    if (!enemy.isAttackAnim()) return false;
    if (enemy.hasHitInCurrentAttack) return true;
    const nowPerf = performance.now();
    if (nowPerf < (enemy.attackHitAllowedAt || 0)) return true;
    this.applyAttackKnockback(enemy);
    this.character.suppressAirAnimation(600);
    this.lockRightInput(600);
    this.applyCharacterHit(enemy, 600);
    this.adjustEndbossAtLeftEdge(enemy);
    enemy.resolveAttackContact?.(this.character);
    enemy.hasHitInCurrentAttack = true;
    return true;
}


/**
 * Applies knockback to the character after attack.
 */
World.prototype.applyAttackKnockback = function () {
    this.character.speedY = 15;
    this.keepCharacterInsideBounds();
}


/**
 * Handles stomp collisions.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.handleStompCollision = function (enemy) {
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
World.prototype.isChickenEnemy = function (enemy) {
    return enemy instanceof Chicken || enemy instanceof SmallChicken;
}


/**
 * Kills a chicken enemy.
 * @param {*} enemy
 */
World.prototype.killChicken = function (enemy) {
    enemy.energy = 0;
    enemy.lastHit = Date.now();
    this.playEffectSound(this.sounds.chickenDead);
}


/**
 * Checks whether endboss body hits are temporarily blocked.
 * @param {*} enemy
 * @returns {boolean}
 */
World.prototype.isEndbossBodyHitBlocked = function (enemy) {
    if (!(enemy instanceof Endboss)) return false;
    return performance.now() < (enemy.postAlertCooldownUntil || 0);
}


/**
 * Applies damage to the character with cooldown.
 * @param {*} enemy
 * @param {number} cooldownMs
 */
World.prototype.applyCharacterHit = function (enemy, cooldownMs) {
    const now = Date.now();
    if (enemy.lastHitOnCharacter && now - enemy.lastHitOnCharacter <= cooldownMs) return;
    this.character.hit(enemy);
    enemy.lastHitOnCharacter = now;
    this.updateHealthStatusBar();
}


/**
 * Ensures the character stays within level bounds.
 */
World.prototype.keepCharacterInsideBounds = function () {
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
World.prototype.adjustEndbossAtLeftEdge = function (enemy) {
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
World.prototype.collisionWithCollectable = function (array, propertyName, updateStatusBarCallback) {
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
World.prototype.isEndbossAwareCollision = function (a, b) {
    if (a instanceof Endboss) return a.isColliding(b);
    if (b instanceof Endboss) return b.isColliding(a);
    return a.isColliding(b);
}