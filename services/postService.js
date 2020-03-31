
const User = require('../models/User');
const Post = require('../models/Post');
const factory = require('../utils/ErrorFactory');
const baseProvider = require('./baseService');


class postProvider extends baseProvider {

    constructor() {
        super();
    }

    async postPost(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const {collaborators, text, title} = req.body;
            const user = await User.findById(req.user.id).select('-password');
    
            const newPost = new Post ({
                text: text,
                title: title,
                collaborators: [],
                user: user.id
            });
    
            if (Array.isArray(collaborators)) {
                for (const collaborator of collaborators) {
                    let person = await User.findOne({username:collaborator});
    
                    if (!person){
                        cb(factory.buildError(res, 400, 'Username doesn\'t exist'), null, userId);
                        return false;
                        
                    } else {
                        newPost.collaborators.push(person.id);
                    }
                }
            } else if (collaborators) {
                let person = await User.findOne({username:collaborators});
    
                if(!person){
                    cb(factory.buildError(res, 400, 'Username doesn\'t exist'), null, userId);
                    return false;
                        
                } else {
                    newPost.collaborators.push(person.id);
                }
            }
    
            const post = await newPost.save();
            cb(null, res.status(200).json(post), userId);
            return true;
    
        } catch (err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    };

    async likePost(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const post = await Post.findById(req.params.id);
            if (post.like.filter(el => el.user.toString() === req.user.id).length > 0) {
                cb(factory.buildError(res, 404, 'Post already liked'), null, userId);
                return false;
            }
            post.like.unshift({user: req.user.id});
            await post.save();
            cb(null, res.status(200).json(post.like), userId);
            return true;
        } catch (err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    };

    async unlikePost(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const post = await Post.findById(req.params.id);
            if (post.like.filter(el => el.user.toString() === req.user.id).length === 0) {
                cb(factory.buildError(res, 400, 'Post has not yet been liked'), null, userId);
                return false;
            }
            const removeIndex = post.like.map(el => el.user.toString()).indexOf(req.user.id);
            post.like.splice(removeIndex, 1);
    
            await post.save();
            cb(null, res.status(200).json(post.like), userId);
            return true;
            
        } catch (err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    };

    async postComment(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);
    
            const newComment =  {
                text: req.body.text,
                name: user.name,
                user: req.user.id
            };
            post.comment.unshift(newComment);
    
            await post.save();
            cb(null, res.status(200).json(post.comment), userId);
            return true;
        } catch (err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    };
    
    async deleteComment(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const post = await Post.findById(req.params.id);
            const comment = post.comment.find(
                comment => comment.id === req.params.comment_id
            );
            if (!comment) {
                cb(factory.buildError(res, 404, 'Comment does not exist'), null, userId);
                return false;
            }
            if (comment.user.toString() !== req.user.id) {
                cb(factory.buildError(res, 404, 'User not authorized'), null, userId);
                return false;
            }
    
            const removeIndex = post.comment.map(el => el.user.toString()).indexOf(req.user.id);
    
            post.comment.splice(removeIndex, 1);
    
            await post.save();
            cb(null, res.status(200).json(post.comment), userId);
            return true;
    
        } catch(err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    };


    
};

module.exports = new postProvider();