/**
 * Represents the main player character (Pepe).
 * Handles movement, animations, camera behavior and character-related sound effects.
 */
class Character extends MovableObject {

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png'
    ]

    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/H-41.png',
        'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png'
    ];

    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/D-51.png',
        'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png',
        'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png',
        'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png'
    ];

    IMAGES_IDLE = [
        'img/2_character_pepe/1_idle/idle/I-1.png',
        'img/2_character_pepe/1_idle/idle/I-2.png',
        'img/2_character_pepe/1_idle/idle/I-3.png',
        'img/2_character_pepe/1_idle/idle/I-4.png',
        'img/2_character_pepe/1_idle/idle/I-5.png',
        'img/2_character_pepe/1_idle/idle/I-6.png',
        'img/2_character_pepe/1_idle/idle/I-7.png',
        'img/2_character_pepe/1_idle/idle/I-8.png',
        'img/2_character_pepe/1_idle/idle/I-9.png',
        'img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    IMAGES_LONG_IDLE = [
        'img/2_character_pepe/1_idle/long_idle/I-11.png',
        'img/2_character_pepe/1_idle/long_idle/I-12.png',
        'img/2_character_pepe/1_idle/long_idle/I-13.png',
        'img/2_character_pepe/1_idle/long_idle/I-14.png',
        'img/2_character_pepe/1_idle/long_idle/I-15.png',
        'img/2_character_pepe/1_idle/long_idle/I-16.png',
        'img/2_character_pepe/1_idle/long_idle/I-17.png',
        'img/2_character_pepe/1_idle/long_idle/I-18.png',
        'img/2_character_pepe/1_idle/long_idle/I-19.png',
        'img/2_character_pepe/1_idle/long_idle/I-20.png',
    ];

    x = 0;
    y = 50;
    height = 250;
    width = 100;
    acceleration = 2.0;
    walking_sound;
    world;
    speed = 5;
    minX = 150 - 720;
    coin = 0;
    bottle = 0;
    deadSoundPlayed = false;
    hurtSoundPlayed = false;
    coyoteTimeMs = 120;
    jumpBufferMs = 120;
    lastGroundedAt = 0;
    lastJumpPressedAt = -Infinity;
    prevSpace = false;
    isJumping = false;
    currentAnimation = null;
    idleTimeoutMs = 15000;
    lastActivityAt = performance.now();
    idleFrameMs = 220;
    sleepFrameMs = 320;
    walkFrameMs = 80;
    hurtFrameMs = 140;
    deadFrameMs = 100;
    lastAnimAt = 0;


    /**
     * Creates the character, loads animation assets and starts physics/loops.
     */
    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.applyGravity();
        this.animate();
        this.frameOffsetX = 20;
        this.frameWidth = this.width - 40;
        this.frameOffsetY = 100;
        this.frameHeight = this.height - 110;
    }


    /**
     * Starts movement and animation loops.
     *
     * @returns {void}
     */
    animate() {
        this.startMovementLoop();
        this.startAnimationLoop();
    }


    /**
     * Starts the movement loop (60 FPS).
     *
     * @returns {void}
     */
    startMovementLoop() {
        setInterval(() => this.tickMovement(), 1000 / 60);
    }


    /**
     * Runs one movement tick: input, movement, sounds, jump buffer and camera.
     *
     * @returns {void}
     */
    tickMovement() {
        if (window.isGamePaused || this.world.stopped) return;
        this.setupWalkSound();
        this.handleWalkSound();
        this.handleHorizontalMovement();
        this.updateActivityState();
        const now = performance.now();
        this.handleJumpInput(now);
        this.updateCamera();
    }


    /**
     * Applies horizontal movement based on keyboard input.
     *
     * @returns {void}
     */
    handleHorizontalMovement() {
        if (this.world.keyBaord.RIGHT && this.x < this.world.level.level_end_x) {
            this.moveRight();
            this.otherDirection = false;
        }
        if (this.world.keyBaord.LEFT && this.x > this.minX) {
            this.moveLeft();
            this.otherDirection = true;
        }
    }


    /**
     * Updates activity state and stops idle sounds when the character is active.
     *
     * @returns {void}
     */
    updateActivityState() {
        const doingSomething = this.isDoingSomething();
        if (!doingSomething) return;
        this.lastActivityAt = performance.now();
        this.stopPepeSnoring?.();
        this.stopPepeCalmBreathing?.();
    }


    /**
     * Checks whether the character is currently performing any activity.
     *
     * @returns {boolean}
     */
    isDoingSomething() {
        return this.isAnyKeyPressed() || this.isAboveGround() || this.isHurt();
    }


    /**
     * Checks whether any relevant movement/action key is pressed.
     *
     * @returns {boolean}
     */
    isAnyKeyPressed() {
        return this.world.keyBaord.RIGHT ||
            this.world.keyBaord.LEFT ||
            this.world.keyBaord.SPACE ||
            this.world.keyBaord.UP ||
            this.world.keyBaord.DOWN ||
            this.world.keyBaord.THROW;
    }


    /**
     * Starts the animation loop.
     *
     * @returns {void}
     */
    startAnimationLoop() {
        setInterval(() => this.tickAnimation(), 50);
    }


    /**
     * Runs one animation tick and selects the correct animation state.
     *
     * @returns {void}
     */
    tickAnimation() {
        if (isGamePaused || this.world.stopped) return;
        const now = performance.now();
        if (this.handleDeadAnimation(now)) return;
        if (this.handleHurtAnimation(now)) return;
        if (this.handleAirAnimation(now)) return;
        this.handleJumpReset();
        this.handleWalkOrIdle(now);
    }


    /**
     * Handles the dead animation state.
     *
     * @param {number} now
     * @returns {boolean} True if handled.
     */
    handleDeadAnimation(now) {
        if (!this.isDead()) return false;
        this.ensureAnimationState('dead');
        this.maybeAdvance(this.IMAGES_DEAD, now, this.deadFrameMs);
        this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
        this.setDeadSound();
        return true;
    }


    /**
     * Handles the hurt animation state.
     *
     * @param {number} now
     * @returns {boolean} True if handled.
     */
    handleHurtAnimation(now) {
        if (!this.isHurt()) return false;
        this.ensureAnimationState('hurt');
        this.maybeAdvance(this.IMAGES_HURT, now, this.hurtFrameMs);
        this.setHurtSound();
        return true;
    }


    /**
     * Handles in-air animation state.
     *
     * @param {number} now
     * @returns {boolean} True if handled.
     */
    handleAirAnimation(now) {
        if (!this.isAboveGround()) return false;
        this.currentAnimation = 'jump';
        this.updateJumpAnimation();
        this.hurtSoundPlayed = false;
        return true;
    }


    /**
     * Resets jump flag once the character is no longer in jump animation.
     *
     * @returns {void}
     */
    handleJumpReset() {
        if (!this.isJumping) return;
        this.img = this.imageCache[this.IMAGES_JUMPING[0]];
        this.isJumping = false;
    }


    /**
     * Handles walk animation or idle/sleep animation depending on input.
     *
     * @param {number} now
     * @returns {void}
     */
    handleWalkOrIdle(now) {
        if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
            this.ensureAnimationState('walk');
            this.maybeAdvance(this.IMAGES_WALKING, now, this.walkFrameMs);
            this.hurtSoundPlayed = false;
            return;
        }
        this.pepeIsSleeping(now);
        this.hurtSoundPlayed = false;
    }


    /**
     * Ensures the animation state is set and resets frame timer when changed.
     *
     * @param {string} name
     * @returns {void}
     */
    ensureAnimationState(name) {
        if (this.currentAnimation === name) return;
        this.currentAnimation = name;
        this.currentImage = 0;
        this.lastAnimAt = 0;
    }


    /**
     * Updates the camera depending on endboss proximity and lock state.
     *
     * @returns {void}
     */
    updateCamera() {
        const boss = this.getEndboss();
        if (this.isCameraLocked()) return this.updateLockedCamera(boss);
        if (this.shouldLockCamera(boss)) return this.lockCamera();
        this.followCamera();
    }


    /**
     * Returns the endboss instance from the current level.
     *
     * @returns {Endboss|undefined}
     */
    getEndboss() {
        return this.world.level.enemies.find(e => e instanceof Endboss);
    }


    /**
     * Checks whether camera is currently locked.
     *
     * @returns {boolean}
     */
    isCameraLocked() {
        return !!this.cameraLocked;
    }


    /**
     * Updates the camera while locked and decides when to unlock again.
     *
     * @param {Endboss|undefined} boss
     * @returns {void}
     */
    updateLockedCamera(boss) {
        this.world.camera_x = this.cameraLockX;
        if (!boss) return this.unlockCamera();
        if (!this.hasPassedBoss(boss)) return;
        if (!this.isAtLockEdge()) return;
        this.unlockCamera();
    }


    /**
     * Unlocks the camera and updates the anchor direction.
     *
     * @returns {void}
     */
    unlockCamera() {
        this.cameraLocked = false;
        this.cameraLockX = null;
        this.cameraAnchor = this.lockDir === 'right' ? 'right' : 'left';
    }


    /**
     * Checks if the character has passed the boss enough to unlock.
     *
     * @param {Endboss} boss
     * @returns {boolean}
     */
    hasPassedBoss(boss) {
        const cL = this.x, cR = this.x + this.width;
        const bL = boss.x, bR = boss.x + boss.width;
        return this.lockDir === 'right' ? (cL > bR + 20) : (cR < bL - 20);
    }


    /**
     * Checks whether the character is at the edge of the lock bounds.
     *
     * @returns {boolean}
     */
    isAtLockEdge() {
        const vx = this.getViewOffsetX();
        const screenX = this.getScreenX(vx);
        const b = this.getLockBounds();
        return this.lockDir === 'right' ? screenX >= b.right : screenX <= b.left;
    }


    /**
     * Returns the current view offset X from the global viewport transform.
     *
     * @returns {number}
     */
    getViewOffsetX() {
        return window.viewOffsetX || 0;
    }


    /**
     * Calculates the character's screen X position.
     *
     * @param {number} vx
     * @returns {number}
     */
    getScreenX(vx) {
        return this.x + (this.world.camera_x || 0) + vx;
    }


    /**
     * Returns camera lock bounds.
     *
     * @returns {{left: number, right: number}}
     */
    getLockBounds() {
        return { left: 120, right: 500 };
    }


    /**
     * Determines if the camera should lock based on boss distance.
     *
     * @param {Endboss|undefined} boss
     * @returns {boolean}
     */
    shouldLockCamera(boss) {
        if (!boss) return false;
        const dist = Math.abs((this.x + this.width / 2) - (boss.x + boss.width / 2));
        return dist < 140;
    }


    /**
     * Locks the camera at the current camera position.
     *
     * @returns {void}
     */
    lockCamera() {
        this.cameraLocked = true;
        this.cameraLockX = this.world.camera_x;
        this.lockDir = this.otherDirection ? 'left' : 'right';
    }


    /**
     * Makes the camera follow the character with smoothing.
     *
     * @returns {void}
     */
    followCamera() {
        const vx = this.getViewOffsetX();
        const anchor = this.getAnchorX();
        const desired = -this.x + (anchor - vx);
        this.applyCameraLerp(desired);
    }


    /**
     * Returns the desired camera anchor X position.
     *
     * @returns {number}
     */
    getAnchorX() {
        const b = this.getLockBounds();
        return this.cameraAnchor === 'right' ? b.right : 100;
    }


    /**
     * Applies a lerp step to the camera x position.
     *
     * @param {number} desired
     * @returns {void}
     */
    applyCameraLerp(desired) {
        const t = this.getCameraLerpFactor();
        const has = typeof this.world.camera_x === 'number';
        const current = has ? this.world.camera_x : desired;
        this.world.camera_x = current + (desired - current) * t;
    }


    /**
     * Returns the lerp factor for camera smoothing.
     *
     * @returns {number}
     */
    getCameraLerpFactor() {
        return 0.12;
    }


    /**
     * Configures the walking sound loop and base volume.
     *
     * @returns {void}
     */
    setupWalkSound() {
        const walkSound = this.world.sounds.pepeWalk;
        if (!walkSound) return;
        walkSound.loop = true;
        walkSound.volume = 0.7;
    }


    /**
     * Plays or pauses the walking sound depending on movement input.
     *
     * @returns {void}
     */
    handleWalkSound() {
        const walkSound = this.world.sounds.pepeWalk;
        if (!walkSound) return;
        if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
            if (walkSound.paused) this.world.playEffectSound(walkSound);
        } else {
            walkSound.pause();
        }
    }


    /**
     * Plays the hurt sound once when entering hurt state.
     *
     * @returns {void}
     */
    setHurtSound() {
        if (this.hurtSoundPlayed) return;
        const hurtSound = this.world?.sounds?.pepeHurt;
        if (!hurtSound) return;
        hurtSound.loop = false;
        hurtSound.volume = 0.2;
        this.world.playEffectSound(hurtSound);
        this.hurtSoundPlayed = true;
    }


    /**
     * Plays the dead sound once when entering dead state.
     *
     * @returns {void}
     */
    setDeadSound() {
        if (this.deadSoundPlayed) return;
        const deadSound = this.world?.sounds?.pepeDead;
        if (!deadSound) return;
        deadSound.loop = false;
        deadSound.volume = 0.3;
        this.world.playEffectSound(deadSound);
        this.deadSoundPlayed = true;
    }


    /**
     * Decides whether the character is sleeping or idling based on inactivity time.
     *
     * @param {number} now
     * @returns {void}
     */
    pepeIsSleeping(now) {
        const isSleeping = (now - this.lastActivityAt) >= this.idleTimeoutMs;
        if (isSleeping) {
            this.sleeping(now);
        } else {
            this.idle(now);
        }
    }


    /**
     * Executes sleeping animation and plays snoring sound when needed.
     *
     * @param {number} now
     * @returns {void}
     */
    sleeping(now) {
        this.stopPepeCalmBreathing?.();
        if (this.currentAnimation !== 'sleep') {
            this.currentAnimation = 'sleep';
            this.currentImage = 0;
            this.lastAnimAt = 0;
            this.playPepeSnoring();
        }
        this.maybeAdvance(this.IMAGES_LONG_IDLE, now, this.sleepFrameMs);
    }


    /**
     * Executes idle animation and plays calm breathing sound when needed.
     *
     * @param {number} now
     * @returns {void}
     */
    idle(now) {
        if (this.currentAnimation !== 'idle') {
            this.currentAnimation = 'idle';
            this.currentImage = 0;
            this.lastAnimAt = 0;
        }
        this.maybeAdvance(this.IMAGES_IDLE, now, this.idleFrameMs);
        this.playPepeCalmBreating();
    }


    /**
     * Advances the animation frames when the configured frame time is reached.
     *
     * @param {string[]} images
     * @param {number} now
     * @param {number} frameMs
     * @returns {void}
     */
    maybeAdvance(images, now, frameMs) {
        if ((now - this.lastAnimAt) >= frameMs) {
            this.playAnimation(images);
            this.lastAnimAt = now;
        }
    }


    /**
     * Triggers a jump and starts the jump sound.
     *
     * @returns {void}
     */
    jump() {
        this.speedY = 27.5;
        this.isJumping = true;
        this.setupJumpSound();
    }


    /**
     * Configures and plays the jump sound.
     *
     * @returns {void}
     */
    setupJumpSound() {
        const jumpSound = this.world?.sounds?.pepeJump;
        if (!jumpSound) return;
        jumpSound.loop = false;
        jumpSound.volume = 0.1;
        this.world.playEffectSound(jumpSound);
    }


    /**
     * Updates jump animation frame based on vertical speed.
     *
     * @returns {void}
     */
    updateJumpAnimation() {
        this.initJumpFrameTimer();
        const now = performance.now();
        if (this.isJumpFrameThrottled(now)) return;
        this.lastJumpFrameAt = now;
        const idx = this.getJumpFrameIndex(this.speedY);
        this.setJumpFrameImage(idx);
    }


    /**
     * Initializes the jump frame timer field.
     *
     * @returns {void}
     */
    initJumpFrameTimer() {
        if (!this.lastJumpFrameAt) this.lastJumpFrameAt = 0;
    }


    /**
     * Checks whether jump frame updates are throttled.
     *
     * @param {number} now
     * @returns {boolean}
     */
    isJumpFrameThrottled(now) {
        return now - this.lastJumpFrameAt < 120;
    }


    /**
     * Calculates the jump frame index based on vertical velocity.
     *
     * @param {number} vy
     * @returns {number}
     */
    getJumpFrameIndex(vy) {
        const up_fast = 0, up_mid = 2, up_slow = 3, apex = 4;
        const down_slow = 5, down_mid = 6, down_fast = 8;
        if (vy > 12) return up_fast;
        if (vy > 6) return up_mid;
        if (vy > 2) return up_slow;
        if (vy > -2) return apex;
        if (vy > -8) return down_slow;
        if (vy > -14) return down_mid;
        return down_fast;
    }


    /**
     * Sets the current jump frame image by index.
     *
     * @param {number} idx
     * @returns {void}
     */
    setJumpFrameImage(idx) {
        const path = this.IMAGES_JUMPING[idx];
        this.img = this.imageCache[path];
    }


    /**
     * Handles jump input with coyote time and jump buffering.
     *
     * @param {number} now
     * @returns {void}
     */
    handleJumpInput(now) {
        const space = this.getSpaceState();
        this.trackJumpPress(space, now);
        const grounded = this.updateGroundedState(now);
        if (this.shouldTriggerBufferedJump(now)) {
            this.triggerBufferedJump();
        }
        if (this.shouldResetJumping(grounded)) {
            this.resetJumping();
        }
    }


    /**
     * Returns the current space key state.
     *
     * @returns {boolean}
     */
    getSpaceState() {
        return !!this.world?.keyBaord?.SPACE;
    }


    /**
     * Tracks jump press timings for buffered jump logic.
     *
     * @param {boolean} space
     * @param {number} now
     * @returns {void}
     */
    trackJumpPress(space, now) {
        if (space && !this.prevSpace) {
            this.lastJumpPressedAt = now;
        }
        this.prevSpace = space;
    }


    /**
     * Updates grounded state and stores last grounded timestamp.
     *
     * @param {number} now
     * @returns {boolean}
     */
    updateGroundedState(now) {
        const grounded = !this.isAboveGround();
        if (grounded) {
            this.lastGroundedAt = now;
        }
        return grounded;
    }


    /**
     * Determines whether a buffered jump should trigger.
     *
     * @param {number} now
     * @returns {boolean}
     */
    shouldTriggerBufferedJump(now) {
        const withinCoyote = (now - this.lastGroundedAt) <= this.coyoteTimeMs;
        const withinBuffer = (now - this.lastJumpPressedAt) <= this.jumpBufferMs;
        return withinBuffer && withinCoyote && !this.isDead();
    }


    /**
     * Triggers the buffered jump action.
     *
     * @returns {void}
     */
    triggerBufferedJump() {
        this.jump();
        this.lastJumpPressedAt = -Infinity;
        this.isJumping = true;
    }


    /**
     * Determines whether jumping flag should be reset.
     *
     * @param {boolean} grounded
     * @returns {boolean}
     */
    shouldResetJumping(grounded) {
        return grounded && this.isJumping && this.speedY === 0;
    }


    /**
     * Resets jumping flag.
     *
     * @returns {void}
     */
    resetJumping() {
        this.isJumping = false;
    }


    /**
     * Plays the snoring sound while sleeping (if allowed).
     *
     * @returns {void}
     */
    playPepeSnoring() {
        const pepeSnoring = this.world?.sounds?.pepeSnoring;
        if (!pepeSnoring || isSoundMuted || isGamePaused || this.world?.stopped) return;
        pepeSnoring.loop = true;
        pepeSnoring.volume = 0.8;
        pepeSnoring.currentTime = 0;
        this.world.playEffectSound(pepeSnoring);
    }


    /**
     * Stops the snoring sound.
     *
     * @returns {void}
     */
    stopPepeSnoring() {
        const pepeSnoring = this.world?.sounds?.pepeSnoring;
        if (!pepeSnoring) return;
        pepeSnoring.pause();
        pepeSnoring.currentTime = 0;
    }


    /**
     * Plays calm breathing sound during idle (if allowed).
     *
     * @returns {void}
     */
    playPepeCalmBreating() {
        const calmBreathing = this.world?.sounds?.pepeCalmBreathing;
        if (!calmBreathing || !calmBreathing.paused || isSoundMuted) return;
        calmBreathing.loop = true;
        calmBreathing.volume = 0.4;
        this.world.playEffectSound(calmBreathing);
    }


    /**
     * Stops calm breathing sound.
     *
     * @returns {void}
     */
    stopPepeCalmBreathing() {
        const calmBreathing = this.world?.sounds?.pepeCalmBreathing;
        if (!calmBreathing) return;
        calmBreathing.pause();
        calmBreathing.currentTime = 0;
    }
}