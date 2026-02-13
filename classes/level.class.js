/**
 * Represents a game level container holding all level objects and layers.
 */
class Level {
    enemies;
    clouds;
    backgroundObjects;
    layers;
    altLayers;
    level_end_x = 3 * 720;


    /**
     * Creates a level with enemies, clouds, background objects and layer definitions.
     * @param {*} enemies - Enemy list for the level.
     * @param {*} clouds - Cloud list for the level.
     * @param {*} backgroundObjects - Background objects for the level.
     * @param {*} layers - Main layer definitions.
     * @param {*} altLayers - Alternative layer definitions.
     */
    constructor(enemies, clouds, backgroundObjects, layers, altLayers) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.layers = layers;
        this.altLayers = altLayers;
    }
}