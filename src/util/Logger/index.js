/* eslint-disable no-console */

class Logger {
    warn(...args) {
        console.warn('>>>', ...args);
    }

    log(...args) {
        console.log('>>>', ...args);
    }

    error(...args) {
        console.error('>>>', ...args);
    }
}

export default new Logger();
