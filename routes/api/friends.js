const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../../middleware/auth');
const friendProvider = require('../../services/friendService');
const adapter = require('../../utils/LoggingAdapter');



router.post('/', [auth, [
    check('recipient', 'Recipient is required').not().isEmpty()

] ], async (req, res) => {
    await friendProvider.postFriend(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'POST', 'api/friends', success, error);
    });
    
});

router.post('/accept', [auth, [
    check('requester', 'Requester is required').not().isEmpty()

] ], async (req, res) => {
    await friendProvider.acceptFriend(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'POST', 'api/users/accept', success, error);
    });
    
});

router.post('/reject', [auth, [
    check('requester', 'Requester is required').not().isEmpty()

] ], async (req, res) => {
    await friendProvider.rejectFriend(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'POST', 'api/users/reject', success, error);
    });

});





module.exports = router;