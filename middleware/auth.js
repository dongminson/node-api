const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const factory = require('../utils/ErrorFactory');

const logger = require('../utils/Logger');



module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if(!token) {
        logger.log(`Authorization error triggered, no token was provided.`);
        return factory.buildError(res, 401, 'No token, authorization denied');
        
    }

    try {
        const decoded = jwt.verify(token, keys.secret);
        req.user = decoded.user;
        next();
    } catch(err) {
        logger.log(`Authorization error triggered, invalid token was provided.`);
        return factory.buildError(res, 401, 'Token is not valid');
    }
}