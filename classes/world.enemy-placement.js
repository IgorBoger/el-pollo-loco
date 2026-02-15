/**
 * Returns min/max x bounds for a zone (0..2).
 * @param {number} zone
 * @returns {{minX:number, maxX:number}}
 */
World.prototype.getEnemyZoneBounds = function (zone) {
    const endX = this.level?.level_end_x ?? 0;
    const startX = this.getSpawnMinX(250);
    const safeEndX = this.getSpawnMaxX(120);
    const width = Math.max(0, safeEndX - startX);
    const third = width / 3;

    return this.buildZoneBounds(zone, startX, third, safeEndX);
}


/**
 * Builds bounds for a specific zone.
 * @param {number} zone
 * @param {number} startX
 * @param {number} third
 * @param {number} safeEndX
 * @returns {{minX:number, maxX:number}}
 */
World.prototype.buildZoneBounds = function (zone, startX, third, safeEndX) {
    const minX = startX + zone * third;
    const maxX = zone === 2 ? safeEndX : startX + (zone + 1) * third;
    return { minX, maxX };
}


/**
* Places an enemy across the level with a minimum x-distance to other enemies.
* @param {*} enemy
* @param {number} minDistance
* @param {number} minPadding
* @param {number} maxPadding
* @returns {void}
*/
World.prototype.placeEnemyWithMinDistance = function (enemy, minDistance, minPadding, maxPadding) {
    const bounds = this.getEnemySpawnBounds(minPadding, maxPadding);
    enemy.x = this.findValidEnemyX(bounds.minX, bounds.maxX, minDistance);
}


/**
* Returns spawn bounds for chicken enemies (keeps start & end zones free).
* @param {number} minPadding
* @param {number} maxPadding
* @returns {{minX:number, maxX:number}}
*/
World.prototype.getEnemySpawnBounds = function (minPadding, maxPadding) {
    const minX = this.getSpawnMinX(minPadding);
    const maxX = this.getSpawnMaxX(maxPadding);
    return { minX, maxX };
}


/**
* Returns the minimum x where enemies may spawn.
* @param {number} minPadding
* @returns {number}
*/
World.prototype.getSpawnMinX = function (minPadding) {
    return Math.max(minPadding, this.getPepeSafeSpawnX());
}


/**
 * Returns a safe start x for enemies relative to Pepe.
 * @returns {number}
 */
World.prototype.getPepeSafeSpawnX = function () {
    const pepeX = this.character?.x ?? 0;
    return pepeX + 180;
}


/**
 * Returns the maximum x where enemies may spawn.
 * @param {number} maxPadding
 * @returns {number}
 */
World.prototype.getSpawnMaxX = function (maxPadding) {
    const maxX = this.getLevelMaxSpawnX(maxPadding);
    return Math.max(0, maxX - this.getBossSafeBuffer());
}


/**
 * Keeps some space before the endboss area.
 * @returns {number}
 */
World.prototype.getBossSafeBuffer = function () {
    return 220;
}


/**
 * Finds a valid x-position that keeps distance to other chicken-type enemies.
 * @param {number} minX
 * @param {number} maxX
 * @param {number} minDistance
 * @returns {number}
 */
World.prototype.findValidEnemyX = function (minX, maxX, minDistance) {
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
World.prototype.isEnemyXFarEnough = function (candidateX, minDistance) {
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
World.prototype.isSpacingOkForEnemy = function (enemy, candidateX, minDistance) {
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
World.prototype.getFallbackEnemyX = function (minX, maxX, minDistance) {
    const used = this.getUsedEnemyXs();
    const slots = this.buildSpawnSlots(minX, maxX, minDistance);
    const slotX = this.pickFirstFreeSlot(slots, used, minDistance);
    return this.applySlotJitter(slotX, minDistance);
}


/**
 * Returns x-positions of already placed chicken-type enemies.
 * @returns {number[]}
 */
World.prototype.getUsedEnemyXs = function () {
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
World.prototype.buildSpawnSlots = function (minX, maxX, step) {
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
World.prototype.pickFirstFreeSlot = function (slots, used, minDistance) {
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
World.prototype.isSlotFree = function (slotX, used, minDistance) {
    return used.every(x => Math.abs(x - slotX) >= minDistance);
}


/**
 * Applies small random jitter inside a slot range.
 * @param {number} baseX
 * @param {number} minDistance
 * @returns {number}
 */
World.prototype.applySlotJitter = function (baseX, minDistance) {
    const jitter = minDistance * 0.3;
    return baseX + (Math.random() * jitter * 2 - jitter);
}


/**
 * Returns the maximum x-value allowed for spawning.
 * @param {number} paddingRight
 * @returns {number}
 */
World.prototype.getLevelMaxSpawnX = function (paddingRight) {
    const endX = this.level?.level_end_x ?? 0;
    return Math.max(0, endX - paddingRight);
}


/**
 * Returns a random number between min and max.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
World.prototype.getRandomXBetween = function (min, max) {
    if (max <= min) return min;
    return min + Math.random() * (max - min);
}