/**
 * Creates a deep clone of a level definition.
 * @param {Level} level
 * @returns {Level}
 */
World.prototype.cloneLevel = function (level) {
    const enemies = level.enemies.map(e => new e.constructor());
    const clouds = level.clouds.map(c => new c.constructor());
    this.distributeCloudsAcrossLevel(clouds, level.level_end_x);
    const backgroundObjects = [];
    const layers = [...level.layers];
    const altLayers = [...level.altLayers];
    return new Level(enemies, clouds, backgroundObjects, layers, altLayers);
};


/**
 * Distributes clouds across the full level width.
 * @param {Cloud[]} clouds
 * @param {number} levelEndX
 * @returns {void}
 */
World.prototype.distributeCloudsAcrossLevel = function (clouds, levelEndX) {
    if (!clouds?.length) return;
    const bounds = this.getCloudSpawnBounds(levelEndX);
    clouds.forEach((cloud, i) => this.placeCloudAtIndex(cloud, i, clouds.length, bounds));
}


/**
 * Returns spawn bounds for clouds.
 * @param {number} levelEndX
 * @returns {{minX:number, maxX:number}}
 */
World.prototype.getCloudSpawnBounds = function (levelEndX) {
    const minX = -300;
    const maxX = Math.max(minX, (levelEndX || 0) - 200);
    return { minX, maxX };
}


/**
 * Places one cloud based on its index plus random jitter.
 * @param {Cloud} cloud
 * @param {number} index
 * @param {number} total
 * @param {{minX:number, maxX:number}} bounds
 * @returns {void}
 */
World.prototype.placeCloudAtIndex = function (cloud, index, total, bounds) {
    const step = (bounds.maxX - bounds.minX) / Math.max(1, total);
    const baseX = bounds.minX + index * step;
    cloud.x = this.applyCloudJitter(baseX, step);
}


/**
 * Applies random jitter to a cloud x-position.
 * @param {number} baseX
 * @param {number} step
 * @returns {number}
 */
World.prototype.applyCloudJitter = function (baseX, step) {
    // const jitter = step * 0.6;
    const jitter = step * 0.9;
    return baseX + (Math.random() * jitter - jitter / 2);
}