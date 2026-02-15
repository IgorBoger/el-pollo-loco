/**
* Assigns world references to all relevant objects and prepares enemies.
*/
World.prototype.setWorld = function () {
    this.character.world = this;
    this.throwableObject.world = this;
    const total = this.level.enemies.length;
    this.level.enemies.forEach((enemy, index) => this.initEnemy(enemy, index, total));
}


/**
 * Initializes one enemy: world ref, position, and loops.
 * @param {*} enemy
 * @returns {void}
 */
World.prototype.initEnemy = function (enemy, index, total) {
    enemy.world = this;
    this.applyEnemySpawnPosition(enemy, index, total);
    enemy.animate?.();
}


/**
 * Applies spawn position rules for enemies.
 * @param {*} enemy
 * @returns {void}
 */
World.prototype.applyEnemySpawnPosition = function (enemy, index, total) {
    if (enemy instanceof Endboss) return enemy.setInitialPosition?.();
    if (!(enemy instanceof Chicken || enemy instanceof SmallChicken)) return;
    if (this.isLevel2OrHigher()) return this.placeEnemyWaveBased(enemy, index, total);
    this.placeEnemyConfigBased(enemy);
}


/**
* Places enemies in visible waves for level 2.
* @param {*} enemy
* @param {number} index
* @param {number} total
* @returns {void}
*/
World.prototype.placeEnemyWaveBased = function (enemy, index, total) {
    const wave = this.getEnemyWave(enemy, index, total);
    const bounds = this.getEnemyZoneBounds(wave);
    const cfg = this.getEnemySpawnConfig();
    enemy.x = this.findValidEnemyX(bounds.minX, bounds.maxX, cfg.minDistance);
}


/**
 * Returns the wave index (0..2) for an enemy in level 2.
 * @param {*} enemy
 * @param {number} index
 * @param {number} total
 * @returns {number}
 */
World.prototype.getEnemyWave = function (enemy, index, total) {
    const pos = this.getEnemyProgress(index, total);
    if (enemy instanceof SmallChicken) return this.getSmallChickenWave(pos);
    return this.getChickenWave(pos);
}


/**
 * Returns progress ratio from 0..1.
 * @param {number} index
 * @param {number} total
 * @returns {number}
 */
World.prototype.getEnemyProgress = function (index, total) {
    if (total <= 1) return 0;
    return index / (total - 1);
}


/**
 * Chickens: early + mid waves.
 * @param {number} pos
 * @returns {number}
 */
World.prototype.getChickenWave = function (pos) {
    if (pos < 0.25) return 0;
    if (pos < 0.60) return 1;
    return 1;
}


/**
 * SmallChickens: mid + late waves (makes level 2 feel harder).
 * @param {number} pos
 * @returns {number}
 */
World.prototype.getSmallChickenWave = function (pos) {
    if (pos < 0.25) return 1;
    if (pos < 0.60) return 2;
    return 2;
}


/**
* Returns enemy spawn tuning based on current level length.
* @returns {{minDistance:number, minPadding:number, maxPadding:number}}
*/
World.prototype.getEnemySpawnConfig = function () {
    if (this.isLevel3OrHigher()) return this.getLevel3SpawnConfig();
    if (this.isLevel2OrHigher()) return this.getLevel2SpawnConfig();
    return this.getLevel1SpawnConfig();
}


/**
 * Returns whether the current level is level2 (or longer).
 * @returns {boolean}
 */
World.prototype.isLevel2OrHigher = function () {
    return (this.level?.level_end_x ?? 0) >= 4 * 720;
}


/**
 * Returns whether the current level is level3 (or longer).
 * @returns {boolean}
 */
World.prototype.isLevel3OrHigher = function () {
    return (this.level?.level_end_x ?? 0) >= 5 * 720;
}


/**
 * Places enemies with the existing config-based logic (level 1).
 * @param {*} enemy
 * @returns {void}
 */
World.prototype.placeEnemyConfigBased = function (enemy) {
    const cfg = this.getEnemySpawnConfig();
    this.placeEnemyWithMinDistance(enemy, cfg.minDistance, cfg.minPadding, cfg.maxPadding);
}


/**
 * Spawn config for level 1.
 * @returns {{minDistance:number, minPadding:number, maxPadding:number}}
 */
World.prototype.getLevel1SpawnConfig = function () {
    return { minDistance: 220, minPadding: 350, maxPadding: 120 };
}


/**
 * Spawn config for level 2.
 * @returns {{minDistance:number, minPadding:number, maxPadding:number}}
 */
World.prototype.getLevel2SpawnConfig = function () {
    return { minDistance: 200, minPadding: 250, maxPadding: 120 };
}


/**
 * Spawn config for level 3.
 * @returns {{minDistance:number, minPadding:number, maxPadding:number}}
 */
World.prototype.getLevel3SpawnConfig = function () {
    return { minDistance: 180, minPadding: 220, maxPadding: 120 };
}