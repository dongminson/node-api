
const logger = require('./Logger');

class loggingAdapter {

    constructor() {

    }

    buildLog(userId, action, route, success, error) {
        if (success == null) {

            if (userId == null) {
                logger.log(`Guest unsuccessfully performed a ${action} request inside ${route}`);
            } else {
                logger.log(`User ${userId} unsuccessfully performed a ${action} request inside ${route}`);
            }

          return error;
        } else {

            if (userId == null) {
                logger.log(`Guest successfully performed a ${action} request inside ${route}`);
            } else {
                logger.log(`User ${userId} successfully performed a ${action} request inside ${route}`);
            }

          return success;
        }
    }
}

module.exports = new loggingAdapter(); //insures it's a singleton