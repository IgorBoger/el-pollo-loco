/**
 * Stores keyboard input states and provides key binding information.
 */
class KeyBaord {
    LEFT = false;
    RIGHT = false;
    UP = false;
    SPACE = false;
    DOWN = false;
    THROW = false;


    /**
     * Returns the key bindings used in the game.
     * @returns {{action: string, key: string}[]}
     */
    getKeyBindings() {
        return [
            { action: 'Links bewegen', key: 'Pfeil links' },
            { action: 'Rechts bewegen', key: 'Pfeil rechts' },
            { action: 'Springen', key: 'Leertaste' },
            { action: 'Werfen', key: 'D' },
        ];
    }
}