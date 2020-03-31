const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const factory = require('../../utils/ErrorFactory');
const postProvider = require('../../services/postService');
const adapter = require('../../utils/LoggingAdapter');



router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty()

] ], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        adapter.buildLog(req.user.id, 'POST', 'api/posts', null, errors);
        return factory.buildError(res, 400,  errors.array());
    }
    await postProvider.postPost(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'POST', 'api/posts', success, error);
    });


});

router.get('/', auth, async (req, res) => {
    postProvider.getAll(Post, 'Post')(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'GET', 'api/posts', success, error);
    });
});


router.get('/:id', auth, async (req, res) => {
    postProvider.getOne(Post, 'Post')(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'GET', 'api/posts/:id', success, error);
    });
});

router.delete('/:id', auth, async (req, res) => {
    postProvider.deleteOne(Post, 'Post')(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'DELETE', 'api/posts/:id', success, error);
    });
});

router.put('/like/:id', auth, async (req, res) => {
    await postProvider.likePost(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'PUT', 'api/like/:id', success, error);
    });
});
router.put('/unlike/:id', auth, async (req, res) => {
    await postProvider.unlikePost(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'PUT', 'api/unlike/:id', success, error);
    });
});


router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()

] ] , async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        adapter.buildLog(req.user.id, 'POST', 'api/posts/comment/:id', null, errors);
        return factory.buildError(res, 400, errors.array());
    }
    await postProvider.postComment(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'POST', 'api/posts/comment/:id', success, error);
    });
});

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    await postProvider.deleteComment(req, res, function(error, success, userId) {
        adapter.buildLog(userId, 'DELETE', 'api/posts/comment/:id', success, error);
    });
});


module.exports = router;