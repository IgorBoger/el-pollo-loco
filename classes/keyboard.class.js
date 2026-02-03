class KeyBaord {
    LEFT = false;
    RIGHT = false;
    UP = false;
    SPACE = false;
    DOWN = false;
    THROW = false;


    constructor() {

    }


    getKeyBindings() {
        return [
            { action: 'Links bewegen', key: 'Pfeil links' },
            { action: 'Rechts bewegen', key: 'Pfeil rechts' },
            { action: 'Springen', key: 'Leertaste' },
            { action: 'Werfen', key: 'D' },
        ];
    }
}