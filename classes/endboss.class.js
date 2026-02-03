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


    setFrameBounds(offsetX, offsetY, widthDiff, heightDiff) {
        this.frameOffsetX = offsetX;
        this.frameWidth = this.width - widthDiff;
        this.frameOffsetY = offsetY;
        this.frameHeight = this.height - heightDiff;
    }


    animate() {
        this.startAiLoop();
        this.startAnimationLoop();
    }


    startAiLoop() {
        this.aiInterval = setInterval(() => this.tickAi(), 1000 / 60);
    }


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


    updateRecoveryOrAi(now, pepeX, dist) {
        if (this.isInRecovery(now)) {
            this.applyRecovery();
            return;
        }
        this.updateAI(now, pepeX, dist);
    }


    startAnimationLoop() {
        this.animationInterval = setInterval(() => this.tickAnimation(), 50);
    }


    tickAnimation() {
        if (window.isGamePaused || this.world?.stopped) return;
        this.updateFrames();
    }


    getCenterX(obj) {
        const w = obj.width || 0;
        return obj.x + w / 2;
    }


    getHorizontalGap(a, b) {
        const aLeft = a.x;
        const aRight = a.x + (a.width || 0);
        const bLeft = b.x;
        const bRight = b.x + (b.width || 0);
        if (aRight < bLeft) return bLeft - aRight;
        if (bRight < aLeft) return aLeft - bRight;
        return 0;
    }


    handleDeath() {
        if (!this.isDead()) return false;
        const changedToDead = this.setAnimation('dead');
        this.handleDeadStateChange(changedToDead);
        this.currentSpeed = 0;
        this.scheduleRemovalAfterDeath();
        return true;
    }


    handleDeadStateChange(changedToDead) {
        if (!changedToDead) return;
        this.playEndbossDeadSound();
        this.initDeadAnimTimer();
    }


    scheduleRemovalAfterDeath() {
        setTimeout(() => this.removeDeadEndboss(), 2000);
    }


    removeDeadEndboss() {
        this.removeFromEnemyList();
        this.stopEndbossIntervals();
    }


    removeFromEnemyList() {
        if (!this.world) return;
        this.world.level.enemies = this.world.level.enemies.filter(e => e !== this);
    }


    stopEndbossIntervals() {
        clearInterval(this.aiInterval);
        clearInterval(this.animationInterval);
    }


    initDeadAnimTimer() {
        if (this.deadAnimEndAt) return;
        const now = performance.now();
        this.deadAnimEndAt = now + this.getDeadAnimDuration();
    }


    getDeadAnimDuration() {
        const frames = this.IMAGES_DEAD?.length || 0;
        return frames * this.deadFrameMs + 80;
    }


    isDeadAnimFinished() {
        if (!this.deadAnimEndAt) return false;
        return performance.now() >= this.deadAnimEndAt;
    }


    isInRecovery(now) {
        return now < this.recoverUntil;
    }


    applyRecovery() {
        if (this.recoveryType === 'hurt') this.ensureHurtAnimation();
        this.stopMovementSoft();
    }


    ensureHurtAnimation() {
        if (this.currentAnimation !== 'hurt') this.setAnimation('hurt');
    }


    stopMovementSoft() {
        this.targetSpeed = 0;
        this.currentSpeed += (0 - this.currentSpeed) * 0.25;
    }


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


    exitRecoveryToAlert(now) {
        if (this.isInRecovery(now)) return false;
        if (this.recoveryType !== 'hurt') return false;
        this.recoveryType = null;
        this.setAnimation('alert');
        this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 350);
        return false;
    }


    updateAggro(dist) {
        if (!this.aggro) return;
        if (this.shouldLoseAggro(dist)) this.clearAggroState();
    }


    shouldLoseAggro(dist) {
        return dist > this.aggroKeepRange;
    }


    clearAggroState() {
        this.aggro = false;
        this.stopChaseState();
        this.enterPatrolState(performance.now());
    }


    enterPatrolState(now) {
        this.setAnimation('walk');
        this.postAlertCooldownUntil = now + 300;
        this.applyPatrolSpeedNow();
    }


    applyPatrolSpeedNow() {
        this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
        this.snapSpeedToTarget();
    }


    snapSpeedToTarget() {
        this.currentSpeed = this.targetSpeed;
    }


    updatePatrol() {
        if (this.isChasing || this.aggro ||
            this.currentAnimation === 'alert' ||
            this.isAttackAnim()) return;
        this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.12;
        this.turnAtPatrolEdges();
    }


    turnAtPatrolEdges() {
        if (this.shouldTurnLeftEdge()) return this.turnToRight();
        if (this.shouldTurnRightEdge()) return this.turnToLeft();
    }


    shouldTurnLeftEdge() {
        return this.patrolDir < 0 && this.x <= this.patrolLeft;
    }


    shouldTurnRightEdge() {
        return this.patrolDir > 0 && this.x >= this.patrolRight;
    }


    turnToRight() {
        this.x = this.patrolLeft;
        this.patrolDir = 1;
        this.currentSpeed = Math.abs(this.currentSpeed) * 0.85;
    }


    turnToLeft() {
        this.x = this.patrolRight;
        this.patrolDir = -1;
        this.currentSpeed = -Math.abs(this.currentSpeed) * 0.85;
    }


    updateChaseMovement(now, pepeX) {
        if (!this.isChasing || this.isAttackAnim()) return;
        const dir = pepeX > this.x ? 1 : -1;
        this.targetSpeed = this.chaseSpeed * dir;
        this.otherDirection = pepeX > this.x;
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.18;
    }


    updateChaseTransitions(now, pepeX, dist) {
        if (!this.isChasing || this.isAttackAnim()) return;
        if (dist <= this.attackRange) { this.startAttack(now, pepeX); return; }
        if (dist <= this.alertRange) return;
        this.stopChaseState();
        this.enterPatrolState(now);
    }


    startAttack(now, pepeX) {
        if (this.shouldSkipAttackStart(now)) return;
        this.prepareAttackStart(now);
        const dir = this.getAttackDirection(pepeX);
        this.applyAttackDirection(pepeX, dir);
        this.setupAttackSpeeds(dir);
        this.setupAttackHitWindow(now);
        this.resetAttackHitFlag();
    }


    shouldSkipAttackStart(now) {
        if (this.isAttackAnim()) return true;
        if (this.isInRecovery(now)) return true;
        if (now < this.postAlertCooldownUntil) return true;
        if (now < (this.forceAlertUntil || 0)) return true;
        return this.currentAnimation === 'hurt';
    }


    prepareAttackStart(now) {
        this.stopChaseState();
        const changedToAttack = this.setAnimation('attackPrep');
        if (changedToAttack) this.playEndbossAttackSound();
        this.attackUntil = now + this.attackDurationMs;
    }


    getAttackDirection(pepeX) {
        return pepeX > this.x ? 1 : -1;
    }


    applyAttackDirection(pepeX, dir) {
        this.attackDir = dir;
        this.otherDirection = pepeX > this.x;
    }


    setupAttackSpeeds(dir) {
        this.currentSpeed = 0;
        this.targetSpeed = this.attackDashSpeed * dir;
    }


    setupAttackHitWindow(now) {
        this.attackHitAllowedAt = now + this.attackHitDelayMs;
    }


    resetAttackHitFlag() {
        this.hasHitInCurrentAttack = false;
    }


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


    facePepe(pepeX) {
        this.otherDirection = pepeX > this.x;
        this.syncPatrolDirToFacing();
    }

    syncPatrolDirToFacing() {
        this.patrolDir = this.otherDirection ? 1 : -1;
    }


    freezeForAlert() {
        this.targetSpeed = 0;
        this.currentSpeed = 0;
        this.facing = this.otherDirection ? 1 : -1;
    }


    handleAlertSounds(now) {
        const isFirstEncounter = !this.appearSoundPlayed;
        if (isFirstEncounter) {
            this.playEndbossAppearSound();
            this.scheduleEndbossAlertSound(now);
            return;
        }
        this.playEndbossAlertSound(now);
    }


    playEndbossAppearSound() {
        if (this.appearSoundPlayed) return;
        const endbossAppear = this.world?.sounds?.endbossAppear;
        if (!endbossAppear) return;
        endbossAppear.loop = false;
        endbossAppear.volume = 0.2;
        this.world.playEffectSound(endbossAppear);
        this.appearSoundPlayed = true;
    }


    playEndbossAlertSound(now) {
        if (now < this.alertSoundCooldownUntil) return;
        const endbossAlert = this.world?.sounds?.endbossAlert;
        if (!endbossAlert) return;
        endbossAlert.loop = false;
        endbossAlert.volume = 0.1;
        this.world.playEffectSound(endbossAlert);
        this.alertSoundCooldownUntil = now + this.alertSoundCooldownMs;
    }


    scheduleEndbossAlertSound(now) {
        this.scheduledAlertSoundAt = now + this.appearToAlertDelayMs;
    }


    tryPlayScheduledEndbossAlertSound(now) {
        if (!this.scheduledAlertSoundAt) return;
        if (now < this.scheduledAlertSoundAt) return;
        this.scheduledAlertSoundAt = 0;
        this.playEndbossAlertSound(now);
    }


    playEndbossAttackSound() {
        const endbossAttack = this.world?.sounds?.endbossAttack;
        if (!endbossAttack) return;
        endbossAttack.loop = false;
        endbossAttack.volume = 0.1;
        this.world.playEffectSound(endbossAttack);
    }


    stop() {
        if (this.aiInterval) clearInterval(this.aiInterval);
        if (this.animationInterval) clearInterval(this.animationInterval);
        this.aiInterval = null;
        this.animationInterval = null;
        this.scheduledAlertSoundAt = 0;
    }


    updateAlertState(now, pepeX, dist) {
        if (!this.isInAlertAnimation()) return;
        this.applyAlertFacing(pepeX);
        this.stopAlertMotion();
        if (this.shouldStayInAlert(now)) return;
        if (this.shouldAttackFromAlert(dist)) return this.startAttack(now, pepeX);
        this.transitionAlertToChase(now, pepeX);
    }


    isInAlertAnimation() {
        return this.currentAnimation === 'alert';
    }


    applyAlertFacing(pepeX) {
        this.otherDirection = pepeX > this.x;
    }


    stopAlertMotion() {
        this.currentSpeed = 0;
    }


    shouldStayInAlert(now) {
        if (now < (this.forceAlertUntil || 0)) return true;
        return now < this.alertUntil;
    }


    shouldAttackFromAlert(dist) {
        return dist <= this.attackRange;
    }


    transitionAlertToChase(now, pepeX) {
        this.setAnimation('walk');
        this.isChasing = true;
        this.chaseUntil = now + 900;
        this.applyInstantChaseSpeed(pepeX);
    }

    applyInstantChaseSpeed(pepeX) {
        const dir = pepeX > this.x ? 1 : -1;
        this.otherDirection = pepeX > this.x;
        this.targetSpeed = this.chaseSpeed * dir;
        this.currentSpeed = this.targetSpeed;
    }


    updateAttackState(now) {
        if (!this.isAttackAnim()) return;
        if (this.isAttackBlocked(now)) return this.blockAttack(now);
        this.tryEnableAttackDamage(now);
        this.applyAttackDash();
        if (now < this.attackUntil) return;
        this.finishAttack(now);
    }


    isAttackAnim() {
        return this.currentAnimation === 'attack' || this.currentAnimation === 'attackPrep';
    }


    isAttackBlocked(now) {
        return this.isInRecovery(now) || now < this.postAlertCooldownUntil;
    }


    blockAttack(now) {
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.attackUntil = now;
        this.setAnimation('alert');
    }


    finishAttack(now) {
        this.resetAttackMotion();
        this.setAnimation('alert');
        this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 350);
        this.startAttackRecovery(now);
    }


    resetAttackMotion() {
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.stopChaseState();
    }

    startAttackRecovery(now) {
        this.recoveryType = 'attack';
        this.recoverUntil = now + this.recoveryAfterAttackMs;
        this.postAlertCooldownUntil = this.recoverUntil;
    }


    shouldAbortAttack(now) {
        return this.isInRecovery(now) || now < this.postAlertCooldownUntil;
    }


    abortAttackToAlert() {
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.setAnimation('alert');
    }


    tryEnableAttackDamage(now) {
        if (this.currentAnimation !== 'attackPrep') return;
        if (now < this.attackHitAllowedAt) return;
        this.setAnimationKeepFrame('attack');
    }


    applyAttackDash() {
        const dir = this.targetSpeed >= 0 ? 1 : -1;
        const dash = (this.currentImage >= this.attackMoveStartFrame) ? this.attackDashSpeed : 0;
        this.currentSpeed += (dash * dir - this.currentSpeed) * 0.25;

    }


    updateFacing() {
        const speedRef = this.getFacingSpeedRef();
        if (this.shouldSkipFacingUpdate(speedRef)) return;
        this.applyFacingLerp(speedRef);
        this.updateDirectionFromFacing();
    }


    getFacingSpeedRef() {
        if (Math.abs(this.currentSpeed) > 0.2) return this.currentSpeed;
        if (Math.abs(this.targetSpeed) > 0.2) return this.targetSpeed;
        return 0;
    }


    shouldSkipFacingUpdate(speedRef) {
        if (this.currentAnimation === 'alert') return true;
        return Math.abs(speedRef) < 0.2 || this.isAttackAnim();
    }


    applyFacingLerp(speedRef) {
        const desired = speedRef >= 0 ? 1 : -1;
        this.facing += (desired - this.facing) * this.facingLerp;
    }


    updateDirectionFromFacing() {
        if (this.facing > this.facingThreshold) {
            this.otherDirection = true;
            return;
        }
        if (this.facing < -this.facingThreshold) {
            this.otherDirection = false;
        }
    }


    applyWalkBob(now) {
        this.ensureBaseY();
        const speedRef = this.getWalkBobSpeedRef();
        if (this.shouldResetWalkBob(speedRef)) {
            this.resetWalkBob();
            return;
        }
        this.applyWalkBobOffset(now);
    }


    ensureBaseY() {
        if (!this.baseY) this.baseY = this.y;
    }


    getWalkBobSpeedRef() {
        return Math.abs(this.currentSpeed) > 0.2
            ? this.currentSpeed
            : this.targetSpeed;
    }


    shouldResetWalkBob(speedRef) {
        if (this.currentAnimation !== 'walk') return true;
        return Math.abs(speedRef) < 0.2;
    }


    resetWalkBob() {
        this.y = this.baseY;
    }


    applyWalkBobOffset(now) {
        const cycleMs = 300;
        const amplitude = 1.2;
        const t = (now % cycleMs) / cycleMs * Math.PI * 2;
        this.y = this.baseY + Math.sin(t) * amplitude;
    }


    applyHorizontalMotion() {
        if (this.isAttackAnim() && this.hasHitInCurrentAttack) return;
        if (Math.abs(this.currentSpeed) < 0.05) return;
        this.x += this.currentSpeed;
    }


    updateFrames() {
        const now = performance.now();
        const frame = this.getFrameConfig();
        this.applyWalkFrameOverride(frame);
        this.maybeAdvance(frame.images, now, frame.frameMs);
    }


    getFrameConfig() {
        const frame = { images: this.IMAGES_WALKING, frameMs: this.walkFrameMs };
        if (this.currentAnimation === 'dead') return this.getDeadFrameConfig(frame);
        if (this.currentAnimation === 'hurt') return this.getHurtFrameConfig(frame);
        if (this.currentAnimation === 'alert') return this.getAlertFrameConfig(frame);
        if (this.isAttackAnim()) return this.getAttackFrameConfig(frame);
        return frame;
    }


    getDeadFrameConfig(frame) {
        frame.images = this.IMAGES_DEAD;
        frame.frameMs = 160;
        return frame;
    }


    getHurtFrameConfig(frame) {
        frame.images = this.IMAGES_HURT;
        frame.frameMs = 120;
        return frame;
    }


    getAlertFrameConfig(frame) {
        frame.images = this.IMAGES_ALERT;
        frame.frameMs = this.alertFrameMs;
        return frame;
    }


    getAttackFrameConfig(frame) {
        frame.images = this.IMAGES_ATTACK;
        frame.frameMs = this.attackFrameMs;
        return frame;
    }


    applyWalkFrameOverride(frame) {
        if (frame.images === this.IMAGES_WALKING) {
            frame.frameMs = this.walkFrameMs;
        }
    }


    faceTo(targetX) {
        this.otherDirection = (targetX < this.x);
    }


    setAnimation(name) {
        if (this.isInRecovery(performance.now()) && name !== 'hurt') return false;
        if (this.currentAnimation === name) return false;
        this.currentAnimation = name;
        this.currentImage = 0;
        this.lastAnimAt = 0;
        return true;
    }


    setAnimationKeepFrame(name) {
        if (this.currentAnimation === name) return false;
        this.currentAnimation = name;
        return true;
    }


    maybeAdvance(images, now, frameMs) {
        if ((now - this.lastAnimAt) >= frameMs) {
            this.playAnimation(images);
            this.lastAnimAt = now;
        }
    }


    hurtFlash() {
        if (this.isDeadAnimation()) return;
        this.enterHurtFlashState();
        this.playEndbossHurtSound();
        const now = performance.now();
        this.applyHurtRecovery(now);
        this.stopChaseState();
        this.scheduleBackToAlert(now);
    }


    isDeadAnimation() {
        return this.currentAnimation === 'dead';
    }


    enterHurtFlashState() {
        this.isHurtLocked = true;
        this.currentAnimation = 'hurt';
        this.currentImage = 0;
        this.lastAnimAt = 0;
        this.recoveryType = 'hurt';
    }


    applyHurtRecovery(now) {
        const until = now + 320;
        this.recoverUntil = Math.max(this.recoverUntil, until);
        this.postAlertCooldownUntil = Math.max(this.postAlertCooldownUntil, until);
    }


    scheduleBackToAlert(now) {
        const ms = Math.max(0, (this.recoverUntil || now) - now);
        setTimeout(() => {
            if (this.isDead()) return;
            if (performance.now() < (this.recoverUntil || 0)) return;
            this.isHurtLocked = false;
            this.setAnimation('alert');
        }, ms);
    }


    playEndbossHurtSound() {
        const endbossHurt = this.world?.sounds?.endbossHurt;
        if (!endbossHurt) return;
        endbossHurt.loop = false;
        endbossHurt.volume = 0.1;
        this.world.playEffectSound(endbossHurt);
    }


    playEndbossDeadSound() {
        if (this.deadSoundPlayed) return;
        const endbossDead = this.world?.sounds?.endbossDead;
        if (!endbossDead) return;
        endbossDead.loop = false;
        endbossDead.volume = 0.3;
        this.world.playEffectSound(endbossDead);
        this.deadSoundPlayed = true;
    }


    stun(ms = 700) {
        const now = performance.now();
        this.enterHurtState(now, ms);
        this.scheduleBackToAlert(now);
    }


    enterHurtState(now, ms) {
        this.recoveryType = 'hurt';
        this.setAnimation('hurt');
        this.stopAttackState(now);
        this.stopChaseState();
        this.stopMovementHard();
        this.recoverUntil = now + ms;
        this.postAlertCooldownUntil = this.recoverUntil + 250;
    }


    stopAttackState(now) {
        this.attackUntil = now;
        this.attackHitAllowedAt = 0;
        this.hasHitInCurrentAttack = true;
        this.currentAnimation = 'hurt';
    }


    stopChaseState() {
        this.isChasing = false;
        this.chaseUntil = 0;
    }


    stopMovementHard() {
        this.currentSpeed = 0;
        this.targetSpeed = 0;
    }


    getMainFrameRect() {
        const x = this.x + (this.frameOffsetX || 0);
        const y = this.y + (this.frameOffsetY || 0);
        const w = this.frameWidth || this.width;
        const h = this.frameHeight || this.height;
        return { x, y, w, h };
    }


    getTopRect(r, split) {
        return { x: r.x, y: r.y, w: r.w, h: split };
    }


    getMiddleRect(r, split, baseX, cm2) {
        const leftExtra = 70;
        const rightCut = 40;
        return { x: baseX - leftExtra, y: r.y + split, w: (r.w - (baseX - r.x)) + leftExtra - rightCut, h: r.h - split - cm2 };
    }


    getFootRect(baseX, feetY, cm2) {
        const footExtraRight = 20;
        return { x: baseX, y: feetY, w: cm2 + footExtraRight, h: cm2 };
    }


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


    mirrorRectX(rect, frame) {
        const relX = rect.x - frame.x;
        const x = frame.x + (frame.w - relX - rect.w);
        return { ...rect, x };
    }


    maybeMirrorRects(rects, frame) {
        if (!this.otherDirection) return rects;
        return rects.map(r => this.mirrorRectX(r, frame));
    }


    getAttackDir() {
        return this.targetSpeed >= 0 ? 1 : -1;
    }


    snapBossToChar(character, dir) {
        const ox = this.frameOffsetX || 0;
        const fw = this.frameWidth || this.width;
        const c = this.getMoFrameRect(character);
        this.x = dir > 0 ? (c.x - ox - fw) : (c.x + c.w - ox);
    }


    applyAttackRecoil(dir) {
        const recoilPx = this.attackRecoilPx || 10;
        this.x -= recoilPx * dir;
    }


    resolveAttackContact(character) {
        if (!character) return;
        const dir = this.getAttackDir();
        this.snapBossToChar(character, dir);
        this.applyAttackRecoil(dir);
        this.currentSpeed = 0;
    }


    getMoFrameRect(mo) {
        const x = mo.x + (mo.frameOffsetX || 0);
        const y = mo.y + (mo.frameOffsetY || 0);
        const w = mo.frameWidth || mo.width;
        const h = mo.frameHeight || mo.height;
        return { x, y, w, h };
    }


    rectsOverlap(a, b) {
        return a.x + a.w > b.x &&
            a.x < b.x + b.w &&
            a.y + a.h > b.y &&
            a.y < b.y + b.h;
    }


    isColliding(mo) {
        if (this.collected || mo.collected) return false;
        const b = this.getMoFrameRect(mo);
        return this.getEndbossHitRects().some(r => this.rectsOverlap(r, b));
    }


    drawFrame(ctx) {
        if (!window.debugHitboxes) return;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'blue';
        this.getEndbossHitRects().forEach(r => {
            ctx.strokeRect(r.x - this.x, r.y - this.y, r.w, r.h);
        });
    }
}