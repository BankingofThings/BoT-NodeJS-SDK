const RED = 31;
const GREEN = 32;
const YELLOW = 33;
const DEFAULT = 39;

class Logger {
    constructor (origin) {
        this.origin = origin;
    }

    success (message) {
        this._log(GREEN, 'SUCCESS', message);
    }

    info (message) {
        this._log(DEFAULT, 'INFO', message);
    }

    warning (message) {
        this._log(YELLOW, 'WARNING', message);
    }

    error (message) {
        this._log(RED, 'ERROR', message);
    }

    _log (color, level, message) {
        console.log(
            Logger._colorCode(color) +
            Logger._timestamp(),
            level + ':',
            this.origin + ' -',
            message,
            Logger._colorCode(DEFAULT)
        );
    }

    static _colorCode (color) {
        return '\x1b[' + color + 'm';
    }

    static _timestamp () {
        return '[' + new Date().toLocaleString() + ']';
    }
}

module.exports = Logger;
