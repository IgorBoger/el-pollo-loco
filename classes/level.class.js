class Level {
    enemies;
    clouds;
    backgroundObjects;
    layers;
    altLayers;


    constructor(enemies, clouds, backgroundObjects, layers, altLayers ) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.layers = layers;
        this.altLayers = altLayers;
    }
}