const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const factory = require('../utils/ErrorFactory');
const baseProvider = require('./baseService');

class authProvider extends baseProvider {

    constructor() {
        super();
    }

    async getAuth(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const user = await User.findById(req.user.id).select('-password')
            cb(null, res.status(200).json(user), userId);
            return true;
        } catch(err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    };

    async postAuth(req, res, cb) {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({ email });
            
            if (!user) {
                cb(factory.buildError(res, 400, 'Invalid credentials'), null, null);
                return false;
            }

            const isMatch = await bcrypt.compare(password, user.password);
    
            if(!isMatch){
                cb(factory.buildError(res, 400, 'Invalid credentials'), null, null);
                return false;
            }

            const payload = {
                user: {
                    id: user.id
                }
            }
    
            jwt.sign(
                payload,
                keys.secret,
                { expiresIn: 36000},
                (err, token) => {
                    if (err) throw err;
                    cb(null, res.status(200).json({ token }), user.id);
                    
                }
            );
            return true;
    
        } catch(err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, null);
            return false;
        } 
    }
    
};

module.exports = new authProvider();