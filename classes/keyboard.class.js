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
            // { action: 'Ducken', key: 'S / Pfeil runter' },
            // { action: 'Interagieren', key: 'E' }
            // → Passe diese Liste an deine tatsächliche Belegung an
        ];
    }
}