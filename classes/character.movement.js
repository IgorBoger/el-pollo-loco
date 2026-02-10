/**
 * Starts the movement loop (60 FPS).
 * @returns {void}
 */
Character.prototype.startMovementLoop = function () {
    setInterval(() => this.tickMovement(), 1000 / 60);
};


/**
 * Runs one movement tick: input, movement, sounds, jump buffer and camera.
 * @returns {void}
 */
Character.prototype.tickMovement = function () {
    if (window.isGamePaused || this.world.stopped) return;
    this.setupWalkSound();
    this.handleWalkSound();
    this.handleHorizontalMovement();
    this.updateActivityState();
    const now = performance.now();
    this.handleJumpInput(now);
    this.updateCamera();
};


/**
 * Applies horizontal movement based on keyboard input.
 * @returns {void}
 */
Character.prototype.handleHorizontalMovement = function () {
    if (this.world.keyBaord.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
    }
    if (this.world.keyBaord.LEFT && this.x > this.minX) {
        this.moveLeft();
        this.otherDirection = true;
    }
};


/**
 * Updates activity state and stops idle sounds when the character is active.
 * @returns {void}
 */
Character.prototype.updateActivityState = function () {
    const doingSomething = this.isDoingSomething();
    if (!doingSomething) return;
    this.lastActivityAt = performance.now();
    this.stopPepeSnoring?.();
    this.stopPepeCalmBreathing?.();
};


/**
 * Checks whether the character is currently performing any activity.
 * @returns {boolean}
 */
Character.prototype.isDoingSomething = function () {
    return this.isAnyKeyPressed() || this.isAboveGround() || this.isHurt();
};


/**
 * Checks whether any relevant movement/action key is pressed.
 * @returns {boolean}
 */
Character.prototype.isAnyKeyPressed = function () {
    return this.world.keyBaord.RIGHT ||
        this.world.keyBaord.LEFT ||
        this.world.keyBaord.SPACE ||
        this.world.keyBaord.UP ||
        this.world.keyBaord.DOWN ||
        this.world.keyBaord.THROW;
};


/**
 * Updates the camera depending on endboss proximity and lock state.
 * @returns {void}
 */
Character.prototype.updateCamera = function () {
    const boss = this.getEndboss();
    if (this.isCameraLocked()) return this.updateLockedCamera(boss);
    if (this.shouldLockCamera(boss)) return this.lockCamera();
    this.followCamera();
};


/**
 * Returns the endboss instance from the current level.
 * @returns {Endboss|undefined}
 */
Character.prototype.getEndboss = function () {
    return this.world.level.enemies.find(e => e instanceof Endboss);
};


/**
 * Checks whether camera is currently locked.
 * @returns {boolean}
 */
Character.prototype.isCameraLocked = function () {
    return !!this.cameraLocked;
};


/**
 * Updates the camera while locked and decides when to unlock again.
 * @param {Endboss|undefined} boss
 * @returns {void}
 */
Character.prototype.updateLockedCamera = function (boss) {
    this.world.camera_x = this.cameraLockX;
    if (!boss) return this.unlockCamera();
    if (!this.shouldUnlockCamera(boss)) return;
    // if (!this.isAtLockEdge()) return;
    this.unlockCamera();
};


/**
 * Unlocks the camera and updates the anchor direction.
 * @returns {void}
 */
Character.prototype.unlockCamera = function () {
    this.cameraLocked = false;
    this.cameraLockX = null;
    this.cameraAnchor = this.lockDir === 'right' ? 'right' : 'left';
};


/**
 * Unlocks camera when the character retreats far enough from the boss.
 * @param {Endboss} boss
 * @returns {boolean}
 */
Character.prototype.shouldUnlockCamera = function (boss) {
    return this.getBossDistance(boss) > 220;
};


/**
 * Returns current horizontal distance between character center and boss center.
 * @param {Endboss} boss
 * @returns {number}
 */
Character.prototype.getBossDistance = function (boss) {
    const c = this.x + this.width / 2;
    const b = boss.x + boss.width / 2;
    return Math.abs(c - b);
};


/**
 * Returns the current view offset X from the global viewport transform.
 * @returns {number}
 */
Character.prototype.getViewOffsetX = function () {
    return window.viewOffsetX || 0;
};


/**
 * Returns camera lock bounds.
 * @returns {{left: number, right: number}}
 */
Character.prototype.getLockBounds = function () {
    return { left: 120, right: 500 };
};


/**
 * Determines if the camera should lock based on boss distance.
 * @param {Endboss|undefined} boss
 * @returns {boolean}
 */
Character.prototype.shouldLockCamera = function (boss) {
    if (!boss) return false;
    const dist = Math.abs((this.x + this.width / 2) - (boss.x + boss.width / 2));
    return dist < 140;
};


/**
 * Locks the camera at the current camera position.
 * @returns {void}
 */
Character.prototype.lockCamera = function () {
    this.cameraLocked = true;
    this.cameraLockX = this.world.camera_x;
    this.lockDir = this.otherDirection ? 'left' : 'right';
};


/**
 * Makes the camera follow the character with smoothing.
 * @returns {void}
 */
Character.prototype.followCamera = function () {
    const vx = this.getViewOffsetX();
    const anchor = this.getAnchorX();
    const desired = -this.x + (anchor - vx);
    this.applyCameraLerp(desired);
};


/**
 * Returns the desired camera anchor X position.
 * @returns {number}
 */
Character.prototype.getAnchorX = function () {
    const b = this.getLockBounds();
    return this.cameraAnchor === 'right' ? b.right : 100;
};


/**
 * Applies a lerp step to the camera x position.
 * @param {number} desired
 * @returns {void}
 */
Character.prototype.applyCameraLerp = function (desired) {
    const t = this.getCameraLerpFactor();
    const has = typeof this.world.camera_x === 'number';
    const current = has ? this.world.camera_x : desired;
    this.world.camera_x = current + (desired - current) * t;
};


/**
 * Returns the lerp factor for camera smoothing.
 * @returns {number}
 */
Character.prototype.getCameraLerpFactor = function () {
    return 0.12;
};


/**
 * Triggers a jump and starts the jump sound.
 * @returns {void}
 */
Character.prototype.jump = function () {
    this.speedY = 27.5;
    this.isJumping = true;
    this.setupJumpSound();
};


/**
 * Configures and plays the jump sound.
 * @returns {void}
 */
Character.prototype.setupJumpSound = function () {
    const jumpSound = this.world?.sounds?.pepeJump;
    if (!jumpSound) return;
    jumpSound.loop = false;
    jumpSound.volume = 0.1;
    this.world.playEffectSound(jumpSound);
};


/**
 * Handles jump input with coyote time and jump buffering.
 * @param {number} now
 * @returns {void}
 */
Character.prototype.handleJumpInput = function (now) {
    const space = this.getSpaceState();
    this.trackJumpPress(space, now);
    const grounded = this.updateGroundedState(now);
    if (this.shouldTriggerBufferedJump(now)) this.triggerBufferedJump();
    if (this.shouldResetJumping(grounded)) this.resetJumping();
};


/**
 * Returns the current space key state.
 * @returns {boolean}
 */
Character.prototype.getSpaceState = function () {
    return !!this.world?.keyBaord?.SPACE;
};


/**
 * Tracks jump press timings for buffered jump logic.
 * @param {boolean} space
 * @param {number} now
 * @returns {void}
 */
Character.prototype.trackJumpPress = function (space, now) {
    if (space && !this.prevSpace) this.lastJumpPressedAt = now;
    this.prevSpace = space;
};


/**
 * Updates grounded state and stores last grounded timestamp.
 * @param {number} now
 * @returns {boolean}
 */
Character.prototype.updateGroundedState = function (now) {
    const grounded = !this.isAboveGround();
    if (grounded) this.lastGroundedAt = now;
    return grounded;
};


/**
 * Determines whether a buffered jump should trigger.
 * @param {number} now
 * @returns {boolean}
 */
Character.prototype.shouldTriggerBufferedJump = function (now) {
    const withinCoyote = (now - this.lastGroundedAt) <= this.coyoteTimeMs;
    const withinBuffer = (now - this.lastJumpPressedAt) <= this.jumpBufferMs;
    return withinBuffer && withinCoyote && !this.isDead();
};


/**
 * Triggers the buffered jump action.
 * @returns {void}
 */
Character.prototype.triggerBufferedJump = function () {
    this.jump();
    this.lastJumpPressedAt = -Infinity;
    this.isJumping = true;
};


/**
 * Determines whether jumping flag should be reset.
 * @param {boolean} grounded
 * @returns {boolean}
 */
Character.prototype.shouldResetJumping = function (grounded) {
    return grounded && this.isJumping && this.speedY === 0;
};


/**
 * Resets jumping flag.
 * @returns {void}
 */
Character.prototype.resetJumping = function () {
    this.isJumping = false;
};