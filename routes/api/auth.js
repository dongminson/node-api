const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const factory = require('../../utils/ErrorFactory');
const authProvider = require('../../services/authService');
const adapter = require('../../utils/LoggingAdapter');


const { check, validationResult } = require('express-validator');

router.get('/', auth, async (req, res) => {
    await authProvider.postAuth(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'GET', 'api/auth', success, error);
    });
});

router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        adapter.buildLog(userId, 'POST', 'api/auth', 'null', errors);
        return factory.buildError(400, errors.array());
    }
    await authProvider.postAuth(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'POST', 'api/auth', success, error);
    });
    
});

module.exports = router;