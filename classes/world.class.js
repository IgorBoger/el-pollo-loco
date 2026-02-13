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
     */
    constructor(canvas, keyBaord) {
        this.initWorldCore(canvas, keyBaord);
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
     */
    initWorldCore(canvas, keyBaord) {
        this.level = this.cloneLevel(level1);
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
    }


    /**
     * Initializes win and end screens.
     */
    initWorldScreens() {
        this.endscreen = new Endscreen(this.ctx, this.canvas);
        this.winscreen = new Winscreen(this.ctx, this.canvas);
    }


    /**
     * Creates a deep clone of a level definition.
     * @param {Level} level
     * @returns {Level}
     */
    cloneLevel(level) {
        const enemies = level.enemies.map(e => new e.constructor());
        const clouds = level.clouds.map(c => new c.constructor());
        const backgroundObjects = [];
        const layers = [...level.layers];
        const altLayers = [...level.altLayers];
        return new Level(enemies, clouds, backgroundObjects, layers, altLayers);
    }


    /**
 * Assigns world references to all relevant objects and prepares enemies.
 */
    setWorld() {
        this.character.world = this;
        this.throwableObject.world = this;

        this.level.enemies.forEach(enemy => this.initEnemy(enemy));
    }


    /**
     * Initializes one enemy: world ref, position, and loops.
     * @param {*} enemy
     * @returns {void}
     */
    initEnemy(enemy) {
        enemy.world = this;
        this.applyEnemySpawnPosition(enemy);
        enemy.animate?.();
    }


    /**
     * Applies spawn position rules for enemies.
     * @param {*} enemy
     * @returns {void}
     */
    applyEnemySpawnPosition(enemy) {
        if (enemy instanceof Endboss) return enemy.setInitialPosition?.();
        if (enemy instanceof Chicken || enemy instanceof SmallChicken) {
            return this.placeEnemyWithMinDistance(enemy, 220, 350, 120);
        }
    }


    /**
 * Places an enemy across the level with a minimum x-distance to other enemies.
 * @param {*} enemy
 * @param {number} minDistance
 * @param {number} minPadding
 * @param {number} maxPadding
 * @returns {void}
 */
    placeEnemyWithMinDistance(enemy, minDistance, minPadding, maxPadding) {
        const minX = minPadding;
        const maxX = this.getLevelMaxSpawnX(maxPadding);
        enemy.x = this.findValidEnemyX(minX, maxX, minDistance);
    }


    /**
     * Finds a valid x-position that keeps distance to other chicken-type enemies.
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minDistance
     * @returns {number}
     */
    findValidEnemyX(minX, maxX, minDistance) {
        const tries = 40;
        for (let i = 0; i < tries; i++) {
            const candidate = this.getRandomXBetween(minX, maxX);
            if (this.isEnemyXFarEnough(candidate, minDistance)) return candidate;
        }
        return this.getFallbackEnemyX(minX, maxX, minDistance);
    }


    /**
     * Checks whether an x-position is far enough from existing chicken-type enemies.
     * @param {number} candidateX
     * @param {number} minDistance
     * @returns {boolean}
     */
    isEnemyXFarEnough(candidateX, minDistance) {
        const enemies = this.level?.enemies || [];
        return enemies.every(e => this.isSpacingOkForEnemy(e, candidateX, minDistance));
    }


    /**
     * Checks spacing only against chicken-like enemies with already assigned x.
     * @param {*} enemy
     * @param {number} candidateX
     * @param {number} minDistance
     * @returns {boolean}
     */
    isSpacingOkForEnemy(enemy, candidateX, minDistance) {
        if (!(enemy instanceof Chicken || enemy instanceof SmallChicken)) return true;
        if (typeof enemy.x !== 'number') return true;
        return Math.abs(enemy.x - candidateX) >= minDistance;
    }


    /**
     * Fallback: places enemy into a "slot" to guarantee distance when random fails.
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minDistance
     * @returns {number}
     */
    getFallbackEnemyX(minX, maxX, minDistance) {
        const used = this.getUsedEnemyXs();
        const slots = this.buildSpawnSlots(minX, maxX, minDistance);
        const slotX = this.pickFirstFreeSlot(slots, used, minDistance);
        return this.applySlotJitter(slotX, minDistance);
    }


    /**
     * Returns x-positions of already placed chicken-type enemies.
     * @returns {number[]}
     */
    getUsedEnemyXs() {
        const enemies = this.level?.enemies || [];
        return enemies
            .filter(e => e instanceof Chicken || e instanceof SmallChicken)
            .map(e => e.x)
            .filter(x => typeof x === 'number');
    }


    /**
     * Builds evenly spaced spawn slots.
     * @param {number} minX
     * @param {number} maxX
     * @param {number} step
     * @returns {number[]}
     */
    buildSpawnSlots(minX, maxX, step) {
        const slots = [];
        for (let x = minX; x <= maxX; x += step) slots.push(x);
        return slots;
    }


    /**
     * Picks the first free slot that keeps minDistance to used positions.
     * @param {number[]} slots
     * @param {number[]} used
     * @param {number} minDistance
     * @returns {number}
     */
    pickFirstFreeSlot(slots, used, minDistance) {
        for (let i = 0; i < slots.length; i++) {
            if (this.isSlotFree(slots[i], used, minDistance)) return slots[i];
        }
        return slots[Math.floor(Math.random() * slots.length)] || 0;
    }


    /**
     * Checks if a slot is free.
     * @param {number} slotX
     * @param {number[]} used
     * @param {number} minDistance
     * @returns {boolean}
     */
    isSlotFree(slotX, used, minDistance) {
        return used.every(x => Math.abs(x - slotX) >= minDistance);
    }


    /**
     * Applies small random jitter inside a slot range.
     * @param {number} baseX
     * @param {number} minDistance
     * @returns {number}
     */
    applySlotJitter(baseX, minDistance) {
        const jitter = minDistance * 0.3;
        return baseX + (Math.random() * jitter * 2 - jitter);
    }


    /**
     * Returns the maximum x-value allowed for spawning.
     * @param {number} paddingRight
     * @returns {number}
     */
    getLevelMaxSpawnX(paddingRight) {
        const endX = this.level?.level_end_x ?? 0;
        return Math.max(0, endX - paddingRight);
    }


    /**
     * Returns a random number between min and max.
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    getRandomXBetween(min, max) {
        if (max <= min) return min;
        return min + Math.random() * (max - min);
    }
}