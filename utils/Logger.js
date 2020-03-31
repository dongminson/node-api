const fs = require('fs');

class Logger {
    constructor() {

    }

    log(message) {
        const timestamp = new Date().toISOString();
        fs.appendFileSync('log/log.txt', `${timestamp} ${message} \n`);
    }
}

module.exports = new Logger(); //insures it's a singleton