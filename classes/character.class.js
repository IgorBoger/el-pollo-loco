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
        super();
        this.initCharacterImages();
        this.applyGravity();
        this.animate();
        this.initCharacterFrame();
    }


    /**
     * Initializes character image assets.
     *
     * @returns {void}
     */
    initCharacterImages() {
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
    }


    /**
     * Initializes character frame bounds for collision/debug frame.
     *
     * @returns {void}
     */
    initCharacterFrame() {
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
}