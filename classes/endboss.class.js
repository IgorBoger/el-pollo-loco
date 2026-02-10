class Endboss extends MovableObject {
    x = 2 * 720 - 140;
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
}