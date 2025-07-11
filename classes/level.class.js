class Level {
    enemies;
    clouds;
    backgroundObjects;
    layers;
    altLayers;
    level_end_x = 1 * 720;
    coinStatus;

    constructor(enemies, clouds, backgroundObjects, layers, altLayers) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.layers = layers;
        this.altLayers = altLayers;
    }
}