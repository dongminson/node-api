const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const factory = require('../utils/ErrorFactory');
const baseProvider = require('./baseService');

class userProvider extends baseProvider {

    constructor() {
        super();
    }

    async deleteUser(req, res, cb) {
        try {

            const userId = (req.user.id) ? req.user.id : null;
            const session = await Transaction.startTransaction();
            const user = await User.findOne(req.user.id);
            if (!user){
                cb(factory.buildError(res, 400, 'User doesn\'t exist'), null, userId);
                return false;
            }
            if (req.params.id !== req.user.id) {
                cb(factory.buildError(res, 401, 'User not authorized'), null, userId);
                return false;
            }
            Post.updateMany({}, { $pull: { comment: { user: req.user.id } } });
            Post.updateMany({}, { $pull: { like: { user: req.user.id } } });
    
            await user.remove();
            Transaction.endTransaction(session);
    
            cb(null, res.status(200).json({ msg: 'User removed'}), userId);
            return true;
    
        } catch (err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    };

    async postUser(req, res, cb) {
        try {
            
            const {username, firstName, lastName, email, password} = req.body;
            const errorOne = await User.findOne({ username });
            const errorTwo = await User.findOne({ email });
    
            if (errorOne) {
                cb(factory.buildError(res, 400, 'Username already exists'), null, null);
                return false;
                
            } else if (errorTwo) {
                cb(factory.buildError(res, 400, 'Email already exists'), null, null);
                return false;
            }
    
            const user = new User({
                username,
                firstName,
                lastName,
                email,
                password
            });
    
            const salt = await bcrypt.genSalt(10);
    
            user.password = await bcrypt.hash(password, salt);
    
            await user.save();
            const payload = {
                user: {
                    id: user.id
                }
            }
    
            jwt.sign(
                payload,
                keys.secret,
                { expiresIn: 360000},
                (err, token) => {
                    if (err) throw err;
                    cb(res.status(200).json({ token }), null, user.id);
                }
            );
            return true;
    
        } catch(err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, null);
            return false;
        } 
    }
    
};

module.exports = new userProvider();