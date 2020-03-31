const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const factory = require('../../utils/ErrorFactory');
const userProvider = require('../../services/userService');
const adapter = require('../../utils/LoggingAdapter');


router.post('/', [
    check('username', 'Username is required').not().isEmpty(),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 characters or more').isLength({min:6})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        adapter.buildLog(req.user.id, 'POST', 'api/users', null, errors);
        return factory.buildError(res, 400, errors.array());

    }
    await userProvider.postUser(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'POST', 'api/users', success, error);
    });

});


router.delete('/:id', auth, async (req, res) => {
    await userProvider.deleteUser(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'DELETE', 'api/users', success, error);
    });
});
module.exports = router;