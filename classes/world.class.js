/**
 * Represents the game world.
 * Manages rendering, collisions, game loop, sounds, enemies, collectibles and screens.
 */
class World {
    character = new Character();
    healthBar = new StatusBar('health');
    coinBar = new StatusBar('coin');
    bottleBar = new StatusBar('bottle');
    endbossBar = new StatusBar('endboss');
    sounds = {
        background: new Audio('audio/background.mp3'),
        pepeWalk: new Audio('audio/pepe_walk.mp3'),
        pepeJump: new Audio('audio/pepe_jump.mp3'),
        pepeHurt: new Audio('audio/pepe_hurt.mp3'),
        pepeDead: new Audio('audio/pepe_dead.mp3'),
        pepeSnoring: new Audio('audio/pepe_snoring.mp3'),
        pepeCalmBreathing: new Audio('audio/pepe_calm_breathing.mp3'),
        collectedCoin: new Audio('audio/collected_coin.mp3'),
        collectedBottle: new Audio('audio/collected_bottle.mp3'),
        thrownBottle: new Audio('audio/thrown_bottle.mp3'),
        chickenDead: new Audio('audio/chicken_dead.mp3'),
        endbossAppear: new Audio('audio/endboss_appear.mp3'),
        endbossAlert: new Audio('audio/endboss_alert.mp3'),
        endbossAttack: new Audio('audio/endboss_attack.mp3'),
        endbossHurt: new Audio('audio/endboss_hurt.mp3'),
        endbossDead: new Audio('audio/endboss_dead.mp3')
    };
    coins = [];
    bottles = [];
    throwableObject = [];
    level = level1;
    backgroundTileCount = 1;
    canvas;
    ctx;
    keyBaord;
    camera_x = 0;
    lastBottleThrow = 0;
    lastDrawLogTime = 0;
    debugHitboxes = true;
    cooldownMs = 4000;


    /**
    * Creates a new game world instance.
    * @param {HTMLCanvasElement} canvas - The canvas element.
    * @param {KeyBaord} keyBaord - Keyboard input handler.
    * @param {Level} levelDefinition - Level definition (e.g. level1, level2).
    */
    constructor(canvas, keyBaord, levelDefinition) {
        this.initWorldCore(canvas, keyBaord, levelDefinition);
        this.initWorldBackground();
        this.initWorldGameLoop();
        this.initWorldCollectables();
        this.initWorldScreens();
        this.winScheduled = false;
    }


    /**
    * Initializes core world references and state.
    * @param {HTMLCanvasElement} canvas
    * @param {KeyBaord} keyBaord
    * @param {Level} levelDefinition
    */
    initWorldCore(canvas, keyBaord, levelDefinition) {
        this.level = this.cloneLevel(levelDefinition || level1);
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyBaord = keyBaord;
        this.stopped = false;
        this.backgroundObjects = [];
        window.debugHitboxes = this.debugHitboxes;
    }


    /**
     * Initializes background rendering and starts the first draw.
     */
    initWorldBackground() {
        this.initBackground();
        setTimeout(() => this.draw(), 100);
    }


    /**
     * Initializes game loop and world references.
     */
    initWorldGameLoop() {
        this.setWorld();
        this.updateBottleStatusBar();
        this.run();
    }


    /**
     * Initializes collectible objects.
     */
    initWorldCollectables() {
        this.initCollectables(this.coins, Coin, 200, 50);
        this.initCollectables(this.bottles, Bottle, 100, 150);
        if (this.isLevel2OrHigher()) this.initCollectables(this.bottles, Bottle, 150, 150);
    }


    /**
     * Initializes win and end screens.
     */
    initWorldScreens() {
        this.endscreen = new Endscreen(this.ctx, this.canvas);
        this.winscreen = new Winscreen(this.ctx, this.canvas);
    }
}