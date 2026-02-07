/**
 * Checks if current animation is alert.
 * @returns {boolean}
 */
Endboss.prototype.isInAlertAnimation = function() {
    return this.currentAnimation === 'alert';
};


/**
 * Applies facing direction during alert.
 * @param {number} pepeX
 */
Endboss.prototype.applyAlertFacing = function(pepeX) {
    this.otherDirection = pepeX > this.x;
};


/**
 * Stops motion while in alert animation.
 */
Endboss.prototype.stopAlertMotion = function() {
    this.currentSpeed = 0;
};


/**
 * Determines whether the endboss should remain in alert.
 * @param {number} now
 * @returns {boolean}
 */
Endboss.prototype.shouldStayInAlert = function(now) {
    if (now < (this.forceAlertUntil || 0)) return true;
    return now < this.alertUntil;
};


/**
 * Checks whether an attack should start directly from alert.
 * @param {number} dist
 * @returns {boolean}
 */
Endboss.prototype.shouldAttackFromAlert = function(dist) {
    return dist <= this.attackRange;
};


/**
 * Transitions from alert into a chasing walk state.
 * @param {number} now
 * @param {number} pepeX
 */
Endboss.prototype.transitionAlertToChase = function(now, pepeX) {
    this.setAnimation('walk');
    this.isChasing = true;
    this.chaseUntil = now + 900;
    this.applyInstantChaseSpeed(pepeX);
};


/**
 * Applies chase speed immediately towards the character.
 * @param {number} pepeX
 */
Endboss.prototype.applyInstantChaseSpeed = function(pepeX) {
    const dir = pepeX > this.x ? 1 : -1;
    this.otherDirection = pepeX > this.x;
    this.targetSpeed = this.chaseSpeed * dir;
    this.currentSpeed = this.targetSpeed;
};


/**
 * Updates attack behavior and transitions out when finished.
 * @param {number} now
 */
Endboss.prototype.updateAttackState = function(now) {
    if (!this.isAttackAnim()) return;
    if (this.isAttackBlocked(now)) return this.blockAttack(now);
    this.tryEnableAttackDamage(now);
    this.applyAttackDash();
    if (now < this.attackUntil) return;
    this.finishAttack(now);
};


/**
 * Checks whether current animation is an attack animation.
 * @returns {boolean}
 */
Endboss.prototype.isAttackAnim = function() {
    return this.currentAnimation === 'attack' || this.currentAnimation === 'attackPrep';
};


/**
 * Checks whether attack is currently blocked by cooldown/recovery.
 * @param {number} now
 * @returns {boolean}
 */
Endboss.prototype.isAttackBlocked = function(now) {
    return this.isInRecovery(now) || now < this.postAlertCooldownUntil;
};


/**
 * Blocks the attack and transitions back into alert.
 * @param {number} now
 */
Endboss.prototype.blockAttack = function(now) {
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.attackUntil = now;
    this.setAnimation('alert');
};


/**
 * Finishes the attack, resets motion and starts recovery.
 * @param {number} now
 */
Endboss.prototype.finishAttack = function(now) {
    this.resetAttackMotion();
    this.setAnimation('alert');
    this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 350);
    this.startAttackRecovery(now);
};


/**
 * Resets motion values and chase state after attack.
 */
Endboss.prototype.resetAttackMotion = function() {
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.stopChaseState();
};


/**
 * Starts the recovery period after an attack.
 * @param {number} now
 */
Endboss.prototype.startAttackRecovery = function(now) {
    this.recoveryType = 'attack';
    this.recoverUntil = now + this.recoveryAfterAttackMs;
    this.postAlertCooldownUntil = this.recoverUntil;
};


/**
 * Checks whether an ongoing attack should be aborted.
 * @param {number} now
 * @returns {boolean}
 */
Endboss.prototype.shouldAbortAttack = function(now) {
    return this.isInRecovery(now) || now < this.postAlertCooldownUntil;
};


/**
 * Aborts the current attack and switches to alert.
 */
Endboss.prototype.abortAttackToAlert = function() {
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.setAnimation('alert');
};


/**
 * Enables the damaging part of the attack after the hit delay.
 * @param {number} now
 */
Endboss.prototype.tryEnableAttackDamage = function(now) {
    if (this.currentAnimation !== 'attackPrep') return;
    if (now < this.attackHitAllowedAt) return;
    this.setAnimationKeepFrame('attack');
};


/**
 * Applies dash movement during attack frames.
 */
Endboss.prototype.applyAttackDash = function() {
    const dir = this.targetSpeed >= 0 ? 1 : -1;
    const dash = (this.currentImage >= this.attackMoveStartFrame) ? this.attackDashSpeed : 0;
    this.currentSpeed += (dash * dir - this.currentSpeed) * 0.25;

};


/**
 * Updates facing direction based on movement speed.
 */
Endboss.prototype.updateFacing = function() {
    const speedRef = this.getFacingSpeedRef();
    if (this.shouldSkipFacingUpdate(speedRef)) return;
    this.applyFacingLerp(speedRef);
    this.updateDirectionFromFacing();
};


/**
 * Chooses a speed reference for facing updates.
 * @returns {number}
 */
Endboss.prototype.getFacingSpeedRef = function() {
    if (Math.abs(this.currentSpeed) > 0.2) return this.currentSpeed;
    if (Math.abs(this.targetSpeed) > 0.2) return this.targetSpeed;
    return 0;
};


/**
 * Determines whether facing update should be skipped.
 * @param {number} speedRef
 * @returns {boolean}
 */
Endboss.prototype.shouldSkipFacingUpdate = function(speedRef) {
    if (this.currentAnimation === 'alert') return true;
    return Math.abs(speedRef) < 0.2 || this.isAttackAnim();
};


/**
 * Smoothly lerps current facing toward desired facing.
 * @param {number} speedRef
 */
Endboss.prototype.applyFacingLerp = function(speedRef) {
    const desired = speedRef >= 0 ? 1 : -1;
    this.facing += (desired - this.facing) * this.facingLerp;
};


/**
 * Updates direction flags based on the facing lerp value.
 */
Endboss.prototype.updateDirectionFromFacing = function() {
    if (this.facing > this.facingThreshold) {
        this.otherDirection = true;
        return;
    }
    if (this.facing < -this.facingThreshold) {
        this.otherDirection = false;
    }
};


/**
 * Applies a subtle vertical bob while walking.
 * @param {number} now
 */
Endboss.prototype.applyWalkBob = function(now) {
    this.ensureBaseY();
    const speedRef = this.getWalkBobSpeedRef();
    if (this.shouldResetWalkBob(speedRef)) {
        this.resetWalkBob();
        return;
    }
    this.applyWalkBobOffset(now);
};


/**
 * Ensures baseY is initialized from current y.
 */
Endboss.prototype.ensureBaseY = function() {
    if (!this.baseY) this.baseY = this.y;
};


/**
 * Gets speed reference for walk bob calculations.
 * @returns {number}
 */
Endboss.prototype.getWalkBobSpeedRef = function() {
    return Math.abs(this.currentSpeed) > 0.2
        ? this.currentSpeed
        : this.targetSpeed;
};


/**
 * Checks whether walk bob should reset.
 * @param {number} speedRef
 * @returns {boolean}
 */
Endboss.prototype.shouldResetWalkBob = function(speedRef) {
    if (this.currentAnimation !== 'walk') return true;
    return Math.abs(speedRef) < 0.2;
};


/**
 * Resets vertical bob to base y.
 */
Endboss.prototype.resetWalkBob = function() {
    this.y = this.baseY;
};


/**
 * Applies sinusoidal y-offset for walk bob.
 * @param {number} now
 */
Endboss.prototype.applyWalkBobOffset = function(now) {
    const cycleMs = 300;
    const amplitude = 1.2;
    const t = (now % cycleMs) / cycleMs * Math.PI * 2;
    this.y = this.baseY + Math.sin(t) * amplitude;
};