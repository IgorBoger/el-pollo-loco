/**
 * Represents the endboss enemy with patrol, alert, chase and attack behavior.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
    x = 2 * 720;
    y = 40;
    height = 400;
    width = 360;


    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    currentAnimation = null;
    walkFrameMs = 110;
    lastAnimAt = 0;
    baseWalkSpeed = 0.7;
    currentSpeed = 0;
    targetSpeed = 0;
    patrolLeft = this.x - 100;
    patrolRight = this.x + 100;
    patrolDir = -1;
    facing = -1;
    facingThreshold = 0.7;
    facingLerp = 0.12;
    alertFrameMs = 300;
    alertDurationMs = 0;
    alertRange = 120;
    alertUntil = 0;
    postAlertCooldownUntil = 0;
    chaseUntil = 0;
    chaseSpeed = 1.5;
    isChasing = false;
    attackFrameMs = 100;
    attackMoveStartFrame = 4;
    attackRange = 60;
    attackDashSpeed = 4;
    attackUntil = 0;
    attackHitDelayMs = 300;
    attackHitAllowedAt = 0;
    aggro = false;
    aggroKeepRange = 400;
    aggroLoseRange = 900;
    recoveryAfterAttackMs = 2400;
    recoverUntil = 0;
    isHurtLocked = false;
    recoveryType = null;
    deadFrameMs = 160;
    deadAnimEndAt = 0;
    appearSoundPlayed = false;
    alertSoundCooldownUntil = 0;
    alertSoundCooldownMs = 1400;
    scheduledAlertSoundAt = 0;
    appearToAlertDelayMs = 950;
    deadSoundPlayed = false;


    /**
     * Creates the endboss, loads all animation images and starts the AI/animation loops.
     */
    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        [this.IMAGES_WALKING, this.IMAGES_ALERT, this.IMAGES_ATTACK,
        this.IMAGES_HURT, this.IMAGES_DEAD].forEach(imgs => this.loadImages(imgs));
        this.alertDurationMs = (this.alertFrameMs * this.IMAGES_ALERT.length) + 60;
        this.attackDurationMs = (this.attackFrameMs * this.IMAGES_ATTACK.length) + 80;
        this.energy = 100;
        this.attackRecoilPx = 10;
        this.currentAnimation = 'walk';
        this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
        this.animate();
        this.setFrameBounds(30, 70, 40, 90);
    }


    /**
     * Sets hitbox/frame offsets and derived frame size.
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} widthDiff
     * @param {number} heightDiff
     */
    setFrameBounds(offsetX, offsetY, widthDiff, heightDiff) {
        this.frameOffsetX = offsetX;
        this.frameWidth = this.width - widthDiff;
        this.frameOffsetY = offsetY;
        this.frameHeight = this.height - heightDiff;
    }


    /**
     * Starts AI and animation update loops.
     */
    animate() {
        this.startAiLoop();
        this.startAnimationLoop();
    }


    /**
     * Starts the 60 FPS AI loop interval.
     */
    startAiLoop() {
        this.aiInterval = setInterval(() => this.tickAi(), 1000 / 60);
    }


    /**
     * AI tick: updates state, movement and decisions if not paused/stopped.
     */
    tickAi() {
        if (window.isGamePaused || this.world?.stopped) return;
        if (this.handleDeath() || !this.world?.character) return;
        const now = performance.now();
        const dist = this.getHorizontalGap(this.world.character, this);
        const pepeX = this.getCenterX(this.world.character);
        this.updateRecoveryOrAi(now, pepeX, dist);
        this.updateFacing();
        this.applyWalkBob(now);
        this.applyHorizontalMotion();
    }


    /**
     * Runs recovery behavior first or normal AI otherwise.
     * @param {number} now
     * @param {number} pepeX
     * @param {number} dist
     */
    updateRecoveryOrAi(now, pepeX, dist) {
        if (this.isInRecovery(now)) {
            this.applyRecovery();
            return;
        }
        this.updateAI(now, pepeX, dist);
    }


    /**
     * Starts the animation loop interval.
     */
    startAnimationLoop() {
        this.animationInterval = setInterval(() => this.tickAnimation(), 50);
    }


    /**
     * Animation tick: advances animation frames if not paused/stopped.
     */
    tickAnimation() {
        if (window.isGamePaused || this.world?.stopped) return;
        this.updateFrames();
    }


    /**
     * Gets the center x-position of an object.
     * @param {object} obj
     * @returns {number}
     */
    getCenterX(obj) {
        const w = obj.width || 0;
        return obj.x + w / 2;
    }


    /**
     * Computes the horizontal gap between two rectangles (0 if overlapping).
     * @param {object} a
     * @param {object} b
     * @returns {number}
     */
    getHorizontalGap(a, b) {
        const aLeft = a.x;
        const aRight = a.x + (a.width || 0);
        const bLeft = b.x;
        const bRight = b.x + (b.width || 0);
        if (aRight < bLeft) return bLeft - aRight;
        if (bRight < aLeft) return aLeft - bRight;
        return 0;
    }


    /**
     * Handles death state and schedules removal.
     * @returns {boolean} True if the endboss is dead.
     */
    handleDeath() {
        if (!this.isDead()) return false;
        const changedToDead = this.setAnimation('dead');
        this.handleDeadStateChange(changedToDead);
        this.currentSpeed = 0;
        this.scheduleRemovalAfterDeath();
        return true;
    }


    /**
     * Runs one-time actions when switching to the dead animation.
     * @param {boolean} changedToDead
     */
    handleDeadStateChange(changedToDead) {
        if (!changedToDead) return;
        this.playEndbossDeadSound();
        this.initDeadAnimTimer();
    }


    /**
     * Schedules removing the dead endboss from the world.
     */
    scheduleRemovalAfterDeath() {
        setTimeout(() => this.removeDeadEndboss(), 2000);
    }


    /**
     * Removes the dead endboss and stops its loops.
     */
    removeDeadEndboss() {
        this.removeFromEnemyList();
        this.stopEndbossIntervals();
    }


    /**
     * Removes this endboss from the world's enemy list.
     */
    removeFromEnemyList() {
        if (!this.world) return;
        this.world.level.enemies = this.world.level.enemies.filter(e => e !== this);
    }


    /**
     * Stops AI and animation intervals.
     */
    stopEndbossIntervals() {
        clearInterval(this.aiInterval);
        clearInterval(this.animationInterval);
    }


    /**
     * Initializes the timestamp when the dead animation is considered finished.
     */
    initDeadAnimTimer() {
        if (this.deadAnimEndAt) return;
        const now = performance.now();
        this.deadAnimEndAt = now + this.getDeadAnimDuration();
    }


    /**
     * Calculates the duration of the dead animation in milliseconds.
     * @returns {number}
     */
    getDeadAnimDuration() {
        const frames = this.IMAGES_DEAD?.length || 0;
        return frames * this.deadFrameMs + 80;
    }


    /**
     * Checks whether the dead animation duration has elapsed.
     * @returns {boolean}
     */
    isDeadAnimFinished() {
        if (!this.deadAnimEndAt) return false;
        return performance.now() >= this.deadAnimEndAt;
    }


    /**
     * Checks whether the endboss is currently in recovery time.
     * @param {number} now
     * @returns {boolean}
     */
    isInRecovery(now) {
        return now < this.recoverUntil;
    }


    /**
     * Applies recovery behavior (stops movement and ensures hurt animation if needed).
     */
    applyRecovery() {
        if (this.recoveryType === 'hurt') this.ensureHurtAnimation();
        this.stopMovementSoft();
    }


    /**
     * Ensures the hurt animation is active while recovering from hurt.
     */
    ensureHurtAnimation() {
        if (this.currentAnimation !== 'hurt') this.setAnimation('hurt');
    }


    /**
     * Softly reduces speed towards zero.
     */
    stopMovementSoft() {
        this.targetSpeed = 0;
        this.currentSpeed += (0 - this.currentSpeed) * 0.25;
    }


    /**
     * Main AI decision pipeline.
     * @param {number} now
     * @param {number} pepeX
     * @param {number} dist
     */
    updateAI(now, pepeX, dist) {
        if (this.exitRecoveryToAlert(now)) return;
        this.tryPlayScheduledEndbossAlertSound(now);
        this.updateAggro(dist);
        this.updatePatrol();
        this.updateChaseMovement(now, pepeX);
        this.updateChaseTransitions(now, pepeX, dist);
        this.tryStartAlert(now, pepeX, dist);
        this.updateAlertState(now, pepeX, dist);
        this.updateAttackState(now, pepeX);
    }


    /**
     * Exits hurt recovery into a short forced alert period.
     * @param {number} now
     * @returns {boolean}
     */
    exitRecoveryToAlert(now) {
        if (this.isInRecovery(now)) return false;
        if (this.recoveryType !== 'hurt') return false;
        this.recoveryType = null;
        this.setAnimation('alert');
        this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 350);
        return false;
    }


    /**
     * Updates aggro state and clears it if the target is too far.
     * @param {number} dist
     */
    updateAggro(dist) {
        if (!this.aggro) return;
        if (this.shouldLoseAggro(dist)) this.clearAggroState();
    }


    /**
     * Determines whether aggro should be lost.
     * @param {number} dist
     * @returns {boolean}
     */
    shouldLoseAggro(dist) {
        return dist > this.aggroKeepRange;
    }


    /**
     * Clears aggro and returns to patrol state.
     */
    clearAggroState() {
        this.aggro = false;
        this.stopChaseState();
        this.enterPatrolState(performance.now());
    }


    /**
     * Enters patrol state after alert/chase and applies patrol speed.
     * @param {number} now
     */
    enterPatrolState(now) {
        this.setAnimation('walk');
        this.postAlertCooldownUntil = now + 300;
        this.applyPatrolSpeedNow();
    }


    /**
     * Applies patrol speed immediately.
     */
    applyPatrolSpeedNow() {
        this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
        this.snapSpeedToTarget();
    }


    /**
     * Snaps current speed to the target speed.
     */
    snapSpeedToTarget() {
        this.currentSpeed = this.targetSpeed;
    }


    /**
     * Updates patrol movement and turns at patrol edges when applicable.
     */
    updatePatrol() {
        if (this.isChasing || this.aggro ||
            this.currentAnimation === 'alert' ||
            this.isAttackAnim()) return;
        this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.12;
        this.turnAtPatrolEdges();
    }


    /**
     * Turns at patrol boundaries based on direction and position.
     */
    turnAtPatrolEdges() {
        if (this.shouldTurnLeftEdge()) return this.turnToRight();
        if (this.shouldTurnRightEdge()) return this.turnToLeft();
    }


    /**
     * Checks if the endboss should turn at the left patrol edge.
     * @returns {boolean}
     */
    shouldTurnLeftEdge() {
        return this.patrolDir < 0 && this.x <= this.patrolLeft;
    }


    /**
     * Checks if the endboss should turn at the right patrol edge.
     * @returns {boolean}
     */
    shouldTurnRightEdge() {
        return this.patrolDir > 0 && this.x >= this.patrolRight;
    }


    /**
     * Turns movement to the right and dampens speed.
     */
    turnToRight() {
        this.x = this.patrolLeft;
        this.patrolDir = 1;
        this.currentSpeed = Math.abs(this.currentSpeed) * 0.85;
    }


    /**
     * Turns movement to the left and dampens speed.
     */
    turnToLeft() {
        this.x = this.patrolRight;
        this.patrolDir = -1;
        this.currentSpeed = -Math.abs(this.currentSpeed) * 0.85;
    }


    /**
     * Updates chasing movement towards the character.
     * @param {number} now
     * @param {number} pepeX
     */
    updateChaseMovement(now, pepeX) {
        if (!this.isChasing || this.isAttackAnim()) return;
        const dir = pepeX > this.x ? 1 : -1;
        this.targetSpeed = this.chaseSpeed * dir;
        this.otherDirection = pepeX > this.x;
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.18;
    }


    /**
     * Handles chase transitions (attack, back to patrol).
     * @param {number} now
     * @param {number} pepeX
     * @param {number} dist
     */
    updateChaseTransitions(now, pepeX, dist) {
        if (!this.isChasing || this.isAttackAnim()) return;
        if (dist <= this.attackRange) { this.startAttack(now, pepeX); return; }
        if (dist <= this.alertRange) return;
        this.stopChaseState();
        this.enterPatrolState(now);
    }


    /**
     * Starts an attack sequence if allowed.
     * @param {number} now
     * @param {number} pepeX
     */
    startAttack(now, pepeX) {
        if (this.shouldSkipAttackStart(now)) return;
        this.prepareAttackStart(now);
        const dir = this.getAttackDirection(pepeX);
        this.applyAttackDirection(pepeX, dir);
        this.setupAttackSpeeds(dir);
        this.setupAttackHitWindow(now);
        this.resetAttackHitFlag();
    }


    /**
     * Checks whether attack start should be skipped.
     * @param {number} now
     * @returns {boolean}
     */
    shouldSkipAttackStart(now) {
        if (this.isAttackAnim()) return true;
        if (this.isInRecovery(now)) return true;
        if (now < this.postAlertCooldownUntil) return true;
        if (now < (this.forceAlertUntil || 0)) return true;
        return this.currentAnimation === 'hurt';
    }


    /**
     * Prepares attack state and sets attack end time.
     * @param {number} now
     */
    prepareAttackStart(now) {
        this.stopChaseState();
        const changedToAttack = this.setAnimation('attackPrep');
        if (changedToAttack) this.playEndbossAttackSound();
        this.attackUntil = now + this.attackDurationMs;
    }


    /**
     * Determines attack direction relative to the character.
     * @param {number} pepeX
     * @returns {number}
     */
    getAttackDirection(pepeX) {
        return pepeX > this.x ? 1 : -1;
    }


    /**
     * Applies attack direction flags.
     * @param {number} pepeX
     * @param {number} dir
     */
    applyAttackDirection(pepeX, dir) {
        this.attackDir = dir;
        this.otherDirection = pepeX > this.x;
    }


    /**
     * Sets up initial attack speed values.
     * @param {number} dir
     */
    setupAttackSpeeds(dir) {
        this.currentSpeed = 0;
        this.targetSpeed = this.attackDashSpeed * dir;
    }


    /**
     * Sets up the time window when attack damage is allowed.
     * @param {number} now
     */
    setupAttackHitWindow(now) {
        this.attackHitAllowedAt = now + this.attackHitDelayMs;
    }


    /**
     * Resets the hit flag for the current attack.
     */
    resetAttackHitFlag() {
        this.hasHitInCurrentAttack = false;
    }


    /**
     * Tries to start alert state when the character is in range.
     * @param {number} now
     * @param {number} pepeX
     * @param {number} dist
     */
    tryStartAlert(now, pepeX, dist) {
        const inCd = this.isInRecovery(now) || now < this.postAlertCooldownUntil;
        if (inCd || this.isHurt?.() || this.isChasing) return;
        if (this.currentAnimation === 'alert' || this.isAttackAnim()) return;
        if (dist > this.alertRange) return;
        this.facePepe(pepeX);
        this.freezeForAlert();
        const changedToAlert = this.setAnimation('alert');
        if (!changedToAlert) return;
        this.aggro = true;
        this.handleAlertSounds(now);
        this.alertUntil = now + this.alertFrameMs * this.IMAGES_ALERT.length + 60;
        this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 300);
    }


    /**
     * Faces the character and aligns patrol direction.
     * @param {number} pepeX
     */
    facePepe(pepeX) {
        this.otherDirection = pepeX > this.x;
        this.syncPatrolDirToFacing();
    }


    /**
     * Syncs patrol direction based on facing direction.
     */
    syncPatrolDirToFacing() {
        this.patrolDir = this.otherDirection ? 1 : -1;
    }


    /**
     * Freezes movement for the alert animation.
     */
    freezeForAlert() {
        this.targetSpeed = 0;
        this.currentSpeed = 0;
        this.facing = this.otherDirection ? 1 : -1;
    }


    /**
     * Handles alert-related sound effects.
     * @param {number} now
     */
    handleAlertSounds(now) {
        const isFirstEncounter = !this.appearSoundPlayed;
        if (isFirstEncounter) {
            this.playEndbossAppearSound();
            this.scheduleEndbossAlertSound(now);
            return;
        }
        this.playEndbossAlertSound(now);
    }


    /**
     * Plays the appear sound once.
     */
    playEndbossAppearSound() {
        if (this.appearSoundPlayed) return;
        const endbossAppear = this.world?.sounds?.endbossAppear;
        if (!endbossAppear) return;
        endbossAppear.loop = false;
        endbossAppear.volume = 0.2;
        this.world.playEffectSound(endbossAppear);
        this.appearSoundPlayed = true;
    }


    /**
     * Plays the alert sound with a cooldown.
     * @param {number} now
     */
    playEndbossAlertSound(now) {
        if (now < this.alertSoundCooldownUntil) return;
        const endbossAlert = this.world?.sounds?.endbossAlert;
        if (!endbossAlert) return;
        endbossAlert.loop = false;
        endbossAlert.volume = 0.1;
        this.world.playEffectSound(endbossAlert);
        this.alertSoundCooldownUntil = now + this.alertSoundCooldownMs;
    }


    /**
     * Schedules playing the alert sound after the appear sound.
     * @param {number} now
     */
    scheduleEndbossAlertSound(now) {
        this.scheduledAlertSoundAt = now + this.appearToAlertDelayMs;
    }


    /**
     * Plays a scheduled alert sound if its time has come.
     * @param {number} now
     */
    tryPlayScheduledEndbossAlertSound(now) {
        if (!this.scheduledAlertSoundAt) return;
        if (now < this.scheduledAlertSoundAt) return;
        this.scheduledAlertSoundAt = 0;
        this.playEndbossAlertSound(now);
    }


    /**
     * Plays the attack sound effect.
     */
    playEndbossAttackSound() {
        const endbossAttack = this.world?.sounds?.endbossAttack;
        if (!endbossAttack) return;
        endbossAttack.loop = false;
        endbossAttack.volume = 0.1;
        this.world.playEffectSound(endbossAttack);
    }


    /**
     * Stops all loops and clears scheduled sound triggers.
     */
    stop() {
        if (this.aiInterval) clearInterval(this.aiInterval);
        if (this.animationInterval) clearInterval(this.animationInterval);
        this.aiInterval = null;
        this.animationInterval = null;
        this.scheduledAlertSoundAt = 0;
    }


    /**
     * Updates alert state and transitions to chase/attack when appropriate.
     * @param {number} now
     * @param {number} pepeX
     * @param {number} dist
     */
    updateAlertState(now, pepeX, dist) {
        if (!this.isInAlertAnimation()) return;
        this.applyAlertFacing(pepeX);
        this.stopAlertMotion();
        if (this.shouldStayInAlert(now)) return;
        if (this.shouldAttackFromAlert(dist)) return this.startAttack(now, pepeX);
        this.transitionAlertToChase(now, pepeX);
    }


    /**
     * Checks if current animation is alert.
     * @returns {boolean}
     */
    isInAlertAnimation() {
        return this.currentAnimation === 'alert';
    }


    /**
     * Applies facing direction during alert.
     * @param {number} pepeX
     */
    applyAlertFacing(pepeX) {
        this.otherDirection = pepeX > this.x;
    }


    /**
     * Stops motion while in alert animation.
     */
    stopAlertMotion() {
        this.currentSpeed = 0;
    }


    /**
     * Determines whether the endboss should remain in alert.
     * @param {number} now
     * @returns {boolean}
     */
    shouldStayInAlert(now) {
        if (now < (this.forceAlertUntil || 0)) return true;
        return now < this.alertUntil;
    }


    /**
     * Checks whether an attack should start directly from alert.
     * @param {number} dist
     * @returns {boolean}
     */
    shouldAttackFromAlert(dist) {
        return dist <= this.attackRange;
    }


    /**
     * Transitions from alert into a chasing walk state.
     * @param {number} now
     * @param {number} pepeX
     */
    transitionAlertToChase(now, pepeX) {
        this.setAnimation('walk');
        this.isChasing = true;
        this.chaseUntil = now + 900;
        this.applyInstantChaseSpeed(pepeX);
    }


    /**
     * Applies chase speed immediately towards the character.
     * @param {number} pepeX
     */
    applyInstantChaseSpeed(pepeX) {
        const dir = pepeX > this.x ? 1 : -1;
        this.otherDirection = pepeX > this.x;
        this.targetSpeed = this.chaseSpeed * dir;
        this.currentSpeed = this.targetSpeed;
    }


    /**
     * Updates attack behavior and transitions out when finished.
     * @param {number} now
     */
    updateAttackState(now) {
        if (!this.isAttackAnim()) return;
        if (this.isAttackBlocked(now)) return this.blockAttack(now);
        this.tryEnableAttackDamage(now);
        this.applyAttackDash();
        if (now < this.attackUntil) return;
        this.finishAttack(now);
    }


    /**
     * Checks whether current animation is an attack animation.
     * @returns {boolean}
     */
    isAttackAnim() {
        return this.currentAnimation === 'attack' || this.currentAnimation === 'attackPrep';
    }


    /**
     * Checks whether attack is currently blocked by cooldown/recovery.
     * @param {number} now
     * @returns {boolean}
     */
    isAttackBlocked(now) {
        return this.isInRecovery(now) || now < this.postAlertCooldownUntil;
    }


    /**
     * Blocks the attack and transitions back into alert.
     * @param {number} now
     */
    blockAttack(now) {
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.attackUntil = now;
        this.setAnimation('alert');
    }


    /**
     * Finishes the attack, resets motion and starts recovery.
     * @param {number} now
     */
    finishAttack(now) {
        this.resetAttackMotion();
        this.setAnimation('alert');
        this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 350);
        this.startAttackRecovery(now);
    }


    /**
     * Resets motion values and chase state after attack.
     */
    resetAttackMotion() {
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.stopChaseState();
    }


    /**
     * Starts the recovery period after an attack.
     * @param {number} now
     */
    startAttackRecovery(now) {
        this.recoveryType = 'attack';
        this.recoverUntil = now + this.recoveryAfterAttackMs;
        this.postAlertCooldownUntil = this.recoverUntil;
    }


    /**
     * Checks whether an ongoing attack should be aborted.
     * @param {number} now
     * @returns {boolean}
     */
    shouldAbortAttack(now) {
        return this.isInRecovery(now) || now < this.postAlertCooldownUntil;
    }


    /**
     * Aborts the current attack and switches to alert.
     */
    abortAttackToAlert() {
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.setAnimation('alert');
    }


    /**
     * Enables the damaging part of the attack after the hit delay.
     * @param {number} now
     */
    tryEnableAttackDamage(now) {
        if (this.currentAnimation !== 'attackPrep') return;
        if (now < this.attackHitAllowedAt) return;
        this.setAnimationKeepFrame('attack');
    }


    /**
     * Applies dash movement during attack frames.
     */
    applyAttackDash() {
        const dir = this.targetSpeed >= 0 ? 1 : -1;
        const dash = (this.currentImage >= this.attackMoveStartFrame) ? this.attackDashSpeed : 0;
        this.currentSpeed += (dash * dir - this.currentSpeed) * 0.25;

    }


    /**
     * Updates facing direction based on movement speed.
     */
    updateFacing() {
        const speedRef = this.getFacingSpeedRef();
        if (this.shouldSkipFacingUpdate(speedRef)) return;
        this.applyFacingLerp(speedRef);
        this.updateDirectionFromFacing();
    }


    /**
     * Chooses a speed reference for facing updates.
     * @returns {number}
     */
    getFacingSpeedRef() {
        if (Math.abs(this.currentSpeed) > 0.2) return this.currentSpeed;
        if (Math.abs(this.targetSpeed) > 0.2) return this.targetSpeed;
        return 0;
    }


    /**
     * Determines whether facing update should be skipped.
     * @param {number} speedRef
     * @returns {boolean}
     */
    shouldSkipFacingUpdate(speedRef) {
        if (this.currentAnimation === 'alert') return true;
        return Math.abs(speedRef) < 0.2 || this.isAttackAnim();
    }


    /**
     * Smoothly lerps current facing toward desired facing.
     * @param {number} speedRef
     */
    applyFacingLerp(speedRef) {
        const desired = speedRef >= 0 ? 1 : -1;
        this.facing += (desired - this.facing) * this.facingLerp;
    }


    /**
     * Updates direction flags based on the facing lerp value.
     */
    updateDirectionFromFacing() {
        if (this.facing > this.facingThreshold) {
            this.otherDirection = true;
            return;
        }
        if (this.facing < -this.facingThreshold) {
            this.otherDirection = false;
        }
    }


    /**
     * Applies a subtle vertical bob while walking.
     * @param {number} now
     */
    applyWalkBob(now) {
        this.ensureBaseY();
        const speedRef = this.getWalkBobSpeedRef();
        if (this.shouldResetWalkBob(speedRef)) {
            this.resetWalkBob();
            return;
        }
        this.applyWalkBobOffset(now);
    }


    /**
     * Ensures baseY is initialized from current y.
     */
    ensureBaseY() {
        if (!this.baseY) this.baseY = this.y;
    }


    /**
     * Gets speed reference for walk bob calculations.
     * @returns {number}
     */
    getWalkBobSpeedRef() {
        return Math.abs(this.currentSpeed) > 0.2
            ? this.currentSpeed
            : this.targetSpeed;
    }


    /**
     * Checks whether walk bob should reset.
     * @param {number} speedRef
     * @returns {boolean}
     */
    shouldResetWalkBob(speedRef) {
        if (this.currentAnimation !== 'walk') return true;
        return Math.abs(speedRef) < 0.2;
    }


    /**
     * Resets vertical bob to base y.
     */
    resetWalkBob() {
        this.y = this.baseY;
    }


    /**
     * Applies sinusoidal y-offset for walk bob.
     * @param {number} now
     */
    applyWalkBobOffset(now) {
        const cycleMs = 300;
        const amplitude = 1.2;
        const t = (now % cycleMs) / cycleMs * Math.PI * 2;
        this.y = this.baseY + Math.sin(t) * amplitude;
    }


    /**
     * Applies horizontal motion based on current speed.
     */
    applyHorizontalMotion() {
        if (this.isAttackAnim() && this.hasHitInCurrentAttack) return;
        if (Math.abs(this.currentSpeed) < 0.05) return;
        this.x += this.currentSpeed;
    }


    /**
     * Updates the animation frames based on current state.
     */
    updateFrames() {
        const now = performance.now();
        const frame = this.getFrameConfig();
        this.applyWalkFrameOverride(frame);
        this.maybeAdvance(frame.images, now, frame.frameMs);
    }


    /**
     * Gets image list and frame duration for the current animation.
     * @returns {{images:string[], frameMs:number}}
     */
    getFrameConfig() {
        const frame = { images: this.IMAGES_WALKING, frameMs: this.walkFrameMs };
        if (this.currentAnimation === 'dead') return this.getDeadFrameConfig(frame);
        if (this.currentAnimation === 'hurt') return this.getHurtFrameConfig(frame);
        if (this.currentAnimation === 'alert') return this.getAlertFrameConfig(frame);
        if (this.isAttackAnim()) return this.getAttackFrameConfig(frame);
        return frame;
    }


    /**
     * Applies dead frame config.
     * @param {{images:string[], frameMs:number}} frame
     * @returns {{images:string[], frameMs:number}}
     */
    getDeadFrameConfig(frame) {
        frame.images = this.IMAGES_DEAD;
        frame.frameMs = 160;
        return frame;
    }


    /**
     * Applies hurt frame config.
     * @param {{images:string[], frameMs:number}} frame
     * @returns {{images:string[], frameMs:number}}
     */
    getHurtFrameConfig(frame) {
        frame.images = this.IMAGES_HURT;
        frame.frameMs = 120;
        return frame;
    }


    /**
     * Applies alert frame config.
     * @param {{images:string[], frameMs:number}} frame
     * @returns {{images:string[], frameMs:number}}
     */
    getAlertFrameConfig(frame) {
        frame.images = this.IMAGES_ALERT;
        frame.frameMs = this.alertFrameMs;
        return frame;
    }


    /**
     * Applies attack frame config.
     * @param {{images:string[], frameMs:number}} frame
     * @returns {{images:string[], frameMs:number}}
     */
    getAttackFrameConfig(frame) {
        frame.images = this.IMAGES_ATTACK;
        frame.frameMs = this.attackFrameMs;
        return frame;
    }


    /**
     * Ensures walking frame duration uses walkFrameMs.
     * @param {{images:string[], frameMs:number}} frame
     */
    applyWalkFrameOverride(frame) {
        if (frame.images === this.IMAGES_WALKING) {
            frame.frameMs = this.walkFrameMs;
        }
    }


    /**
     * Faces the boss to a target x-position.
     * @param {number} targetX
     */
    faceTo(targetX) {
        this.otherDirection = (targetX < this.x);
    }


    /**
     * Sets a new animation and resets frame counters.
     * @param {string} name
     * @returns {boolean} True if animation changed.
     */
    setAnimation(name) {
        if (this.isInRecovery(performance.now()) && name !== 'hurt') return false;
        if (this.currentAnimation === name) return false;
        this.currentAnimation = name;
        this.currentImage = 0;
        this.lastAnimAt = 0;
        return true;
    }


    /**
     * Sets a new animation without resetting the current frame index.
     * @param {string} name
     * @returns {boolean} True if animation changed.
     */
    setAnimationKeepFrame(name) {
        if (this.currentAnimation === name) return false;
        this.currentAnimation = name;
        return true;
    }


    /**
     * Advances animation when the frame duration elapsed.
     * @param {string[]} images
     * @param {number} now
     * @param {number} frameMs
     */
    maybeAdvance(images, now, frameMs) {
        if ((now - this.lastAnimAt) >= frameMs) {
            this.playAnimation(images);
            this.lastAnimAt = now;
        }
    }


    /**
     * Triggers a hurt flash reaction (sound, recovery and transition).
     */
    hurtFlash() {
        if (this.isDeadAnimation()) return;
        this.enterHurtFlashState();
        this.playEndbossHurtSound();
        const now = performance.now();
        this.applyHurtRecovery(now);
        this.stopChaseState();
        this.scheduleBackToAlert(now);
    }


    /**
     * Checks whether the boss is currently in the dead animation.
     * @returns {boolean}
     */
    isDeadAnimation() {
        return this.currentAnimation === 'dead';
    }


    /**
     * Initializes internal state for the hurt flash animation.
     */
    enterHurtFlashState() {
        this.isHurtLocked = true;
        this.currentAnimation = 'hurt';
        this.currentImage = 0;
        this.lastAnimAt = 0;
        this.recoveryType = 'hurt';
    }


    /**
     * Applies a short recovery window after getting hurt.
     * @param {number} now
     */
    applyHurtRecovery(now) {
        const until = now + 320;
        this.recoverUntil = Math.max(this.recoverUntil, until);
        this.postAlertCooldownUntil = Math.max(this.postAlertCooldownUntil, until);
    }


    /**
     * Schedules transition back to alert when recovery ends.
     * @param {number} now
     */
    scheduleBackToAlert(now) {
        const ms = Math.max(0, (this.recoverUntil || now) - now);
        setTimeout(() => {
            if (this.isDead()) return;
            if (performance.now() < (this.recoverUntil || 0)) return;
            this.isHurtLocked = false;
            this.setAnimation('alert');
        }, ms);
    }


    /**
     * Plays the hurt sound effect.
     */
    playEndbossHurtSound() {
        const endbossHurt = this.world?.sounds?.endbossHurt;
        if (!endbossHurt) return;
        endbossHurt.loop = false;
        endbossHurt.volume = 0.1;
        this.world.playEffectSound(endbossHurt);
    }


    /**
     * Plays the dead sound effect once.
     */
    playEndbossDeadSound() {
        if (this.deadSoundPlayed) return;
        const endbossDead = this.world?.sounds?.endbossDead;
        if (!endbossDead) return;
        endbossDead.loop = false;
        endbossDead.volume = 0.3;
        this.world.playEffectSound(endbossDead);
        this.deadSoundPlayed = true;
    }


    /**
     * Stuns the boss for a given duration.
     * @param {number} [ms=700]
     */
    stun(ms = 700) {
        const now = performance.now();
        this.enterHurtState(now, ms);
        this.scheduleBackToAlert(now);
    }


    /**
     * Enters hurt state, stops movement and sets recovery timers.
     * @param {number} now
     * @param {number} ms
     */
    enterHurtState(now, ms) {
        this.recoveryType = 'hurt';
        this.setAnimation('hurt');
        this.stopAttackState(now);
        this.stopChaseState();
        this.stopMovementHard();
        this.recoverUntil = now + ms;
        this.postAlertCooldownUntil = this.recoverUntil + 250;
    }


    /**
     * Stops attack-related state immediately.
     * @param {number} now
     */
    stopAttackState(now) {
        this.attackUntil = now;
        this.attackHitAllowedAt = 0;
        this.hasHitInCurrentAttack = true;
        this.currentAnimation = 'hurt';
    }


    /**
     * Clears chase state flags.
     */
    stopChaseState() {
        this.isChasing = false;
        this.chaseUntil = 0;
    }


    /**
     * Hard-stops movement values.
     */
    stopMovementHard() {
        this.currentSpeed = 0;
        this.targetSpeed = 0;
    }


    /**
     * Gets the main frame rect in world coordinates.
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getMainFrameRect() {
        const x = this.x + (this.frameOffsetX || 0);
        const y = this.y + (this.frameOffsetY || 0);
        const w = this.frameWidth || this.width;
        const h = this.frameHeight || this.height;
        return { x, y, w, h };
    }


    /**
     * Returns a top hit rect based on a split height.
     * @param {{x:number, y:number, w:number, h:number}} r
     * @param {number} split
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getTopRect(r, split) {
        return { x: r.x, y: r.y, w: r.w, h: split };
    }


    /**
     * Returns a middle hit rect based on split and cut parameters.
     * @param {{x:number, y:number, w:number, h:number}} r
     * @param {number} split
     * @param {number} baseX
     * @param {number} cm2
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getMiddleRect(r, split, baseX, cm2) {
        const leftExtra = 70;
        const rightCut = 40;
        return { x: baseX - leftExtra, y: r.y + split, w: (r.w - (baseX - r.x)) + leftExtra - rightCut, h: r.h - split - cm2 };
    }


    /**
     * Returns a foot hit rect.
     * @param {number} baseX
     * @param {number} feetY
     * @param {number} cm2
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getFootRect(baseX, feetY, cm2) {
        const footExtraRight = 20;
        return { x: baseX, y: feetY, w: cm2 + footExtraRight, h: cm2 };
    }


    /**
     * Builds the composite hit rectangles for endboss collision.
     * @returns {{x:number, y:number, w:number, h:number}[]}
     */
    getEndbossHitRects() {
        const r = this.getMainFrameRect();
        const split = r.h * 0.5;
        const cut = r.w / 3;
        const cm2 = 80;
        const baseX = r.x + cut;
        const feetY = r.y + r.h - cm2;
        const rects = [this.getTopRect(r, split),
        this.getMiddleRect(r, split, baseX, cm2),
        this.getFootRect(baseX, feetY, cm2)];
        return this.maybeMirrorRects(rects, r);
    }


    /**
     * Mirrors a rect horizontally within a frame.
     * @param {{x:number, y:number, w:number, h:number}} rect
     * @param {{x:number, y:number, w:number, h:number}} frame
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    mirrorRectX(rect, frame) {
        const relX = rect.x - frame.x;
        const x = frame.x + (frame.w - relX - rect.w);
        return { ...rect, x };
    }


    /**
     * Mirrors rects when facing the opposite direction.
     * @param {{x:number, y:number, w:number, h:number}[]} rects
     * @param {{x:number, y:number, w:number, h:number}} frame
     * @returns {{x:number, y:number, w:number, h:number}[]}
     */
    maybeMirrorRects(rects, frame) {
        if (!this.otherDirection) return rects;
        return rects.map(r => this.mirrorRectX(r, frame));
    }


    /**
     * Gets attack direction based on target speed sign.
     * @returns {number}
     */
    getAttackDir() {
        return this.targetSpeed >= 0 ? 1 : -1;
    }


    /**
     * Snaps boss position next to the character for contact resolution.
     * @param {object} character
     * @param {number} dir
     */
    snapBossToChar(character, dir) {
        const ox = this.frameOffsetX || 0;
        const fw = this.frameWidth || this.width;
        const c = this.getMoFrameRect(character);
        this.x = dir > 0 ? (c.x - ox - fw) : (c.x + c.w - ox);
    }


    /**
     * Applies recoil movement after attack contact.
     * @param {number} dir
     */
    applyAttackRecoil(dir) {
        const recoilPx = this.attackRecoilPx || 10;
        this.x -= recoilPx * dir;
    }


    /**
     * Resolves attack contact with the character.
     * @param {object} character
     */
    resolveAttackContact(character) {
        if (!character) return;
        const dir = this.getAttackDir();
        this.snapBossToChar(character, dir);
        this.applyAttackRecoil(dir);
        this.currentSpeed = 0;
    }


    /**
     * Gets a movable object's frame rect in world coordinates.
     * @param {object} mo
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getMoFrameRect(mo) {
        const x = mo.x + (mo.frameOffsetX || 0);
        const y = mo.y + (mo.frameOffsetY || 0);
        const w = mo.frameWidth || mo.width;
        const h = mo.frameHeight || mo.height;
        return { x, y, w, h };
    }


    /**
     * Checks if two rectangles overlap.
     * @param {{x:number, y:number, w:number, h:number}} a
     * @param {{x:number, y:number, w:number, h:number}} b
     * @returns {boolean}
     */
    rectsOverlap(a, b) {
        return a.x + a.w > b.x &&
            a.x < b.x + b.w &&
            a.y + a.h > b.y &&
            a.y < b.y + b.h;
    }


    /**
     * Collision check with another movable object.
     * @param {object} mo
     * @returns {boolean}
     */
    isColliding(mo) {
        if (this.collected || mo.collected) return false;
        const b = this.getMoFrameRect(mo);
        return this.getEndbossHitRects().some(r => this.rectsOverlap(r, b));
    }


    /**
     * Draws debug hitboxes for the endboss when enabled.
     * @param {CanvasRenderingContext2D} ctx
     */
    drawFrame(ctx) {
        if (!window.debugHitboxes) return;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'blue';
        this.getEndbossHitRects().forEach(r => {
            ctx.strokeRect(r.x - this.x, r.y - this.y, r.w, r.h);
        });
    }
}