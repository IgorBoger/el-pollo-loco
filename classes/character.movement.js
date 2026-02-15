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
    if (this.world.isControlsLocked()) return;
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
    if (this.shouldMoveRight()) this.moveCharacterRight();
    if (this.shouldMoveLeft()) this.moveCharacterLeft();
};


/**
 * Determines whether the character is allowed to move right.
 * @returns {boolean}
 */
Character.prototype.shouldMoveRight = function () {
    if (!this.world.keyBaord.RIGHT) return false;
    if (this.isRightLocked()) return false;
    return this.x < this.world.level.level_end_x;
};


/**
 * Determines whether right movement is temporarily locked.
 * @returns {boolean}
 */
Character.prototype.isRightLocked = function () {
    const until = this.world.keyBaord.rightLockedUntil || 0;
    return performance.now() < until;
};


/**
 * Moves the character to the right and sets facing.
 * @returns {void}
 */
Character.prototype.moveCharacterRight = function () {
    this.moveRight();
    this.otherDirection = false;
};


/**
 * Determines whether the character is allowed to move left.
 * @returns {boolean}
 */
Character.prototype.shouldMoveLeft = function () {
    if (!this.world.keyBaord.LEFT) return false;
    this.world.keyBaord.rightLockedUntil = 0;
    return this.x > this.minX;
};


/**
 * Moves the character to the left and sets facing.
 * @returns {void}
 */
Character.prototype.moveCharacterLeft = function () {
    this.moveLeft();
    this.otherDirection = true;
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
    if (this.world?.isControlsLocked?.()) return false;
    return this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT ||
        this.world.keyBaord.SPACE || this.world.keyBaord.UP ||
        this.world.keyBaord.DOWN || this.world.keyBaord.THROW;
};


/**
 * Updates the camera depending on endboss proximity and lock state.
 * @returns {void}
 */
Character.prototype.updateCamera = function () {
    this.followCamera();
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
 * Follows the character with a fixed left anchor (no right-stick).
 * @returns {void}
 */
Character.prototype.followCamera = function () {
    const vx = this.getViewOffsetX();
    const anchor = 100;
    const desired = -this.x + (anchor - vx);
    this.applyCameraLerp(desired);
};


/**
 * Returns the current view offset X from the global viewport transform.
 * @returns {number}
 */
Character.prototype.getViewOffsetX = function () {
    return window.viewOffsetX || 0;
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