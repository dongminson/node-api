
const factory = require('../utils/ErrorFactory');
const Post = require('../models/Post');


class baseProvider {

    constructor() {

    }

    async createOne(Model, name) {
        return async (req, res, cb) => {
            try {
                const userId = (req.user.id) ? req.user.id : null;
        
                const instance = await Model.create(req.body);

                if (!instance) {
                    cb(factory.buildError(res, 404, `Server Error`), null, userId);
                    return false;
                } else {
                    cb(null, res.status(200).json(instance), userId);
                    return true;
                }
        
            } catch (err) {
                cb(factory.buildError(res, 500, 'Server Error'), null, userId);
                return false;
            }
        }
    }

    getOne (Model, name) {  
        return async (req, res, cb) => {
            try {
                const userId = (req.user.id) ? req.user.id : null;
                const instance = await Model.findById(req.params.id);
                if (!instance) {
                    cb(factory.buildError(res, 404, `${name} not found`), null, userId);
                    return false;
                } else {
                    cb(null, res.status(200).json(instance), null);
                    return true;
                }
        
            } catch (err) {
                if(err.kind === 'ObjectId') {
                    cb(factory.buildError(res, 404, `${name} not found`), null, userId);
                    return false;
                } else {
                    cb(factory.buildError(res, 500, 'Server Error'), null, userId);
                    return false;
                }
            }
        }
    };

    getAll (Model, name) {
        return async (req, res, cb) => {
            try {
                const userId = (req.user.id) ? req.user.id : null;
                const {page, limit} = req.body;
                const pageOptions = {
                    page: page || 0,
                    limit: limit || 10
                }

                const instances = await Model.find()
                .skip(pageOptions.page*pageOptions.limit)
                .limit(pageOptions.limit)
                .sort({ date: -1});
                    
                if (!instances) {
                    cb(factory.buildError(res, 404, `${name}s not found`), null, userId);
                    return false;
                } else {
                    cb(null, res.status(200).json(instances), userId);
                    return true;
                }
                
        
            } catch (err) {
                cb(factory.buildError(res, 500, 'Server Error'), null, userId);
                return false;
            }
        }
    };

    deleteOne(Model, name) { 
        return async (req, res, cb) => {
            try {
                const userId = (req.user.id) ? req.user.id : null;
                const instance = await Model.findById(req.params.id);
                if (!instance) {
                    cb(factory.buildError(res, 404, `${name} not found`), null, userId);
                    return false;
                }
                if (instance.user.toString() !== req.user.id) {
                    cb(factory.buildError(res, 401, 'User not authorized'), null, userId);
                    return false;
                }
                await instance.remove();
                cb(null, res.status(200).json({ msg: `${name} removed`}), userId);
                return true;
            } catch (err) {
                if(err.kind === 'ObjectId') {
                cb(factory.buildError(res, 404, `${name} not found`), null, userId);
                return false;
        
                } else {
                    cb(factory.buildError(res, 500, 'Server Error'), null, userId);
                    return false;
                }
            }
        }
    };

    async updateOne(Model, name) {

        return async (req, res, cb) => {
            try {
                const userId = (req.user.id) ? req.user.id : null;
                const instance = await Model.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true
                });
                if (!instance) {
                    cb(factory.buildError(res, 404, `${name} not found`), null, userId);
                    return false;
                }
                if (instance.user.toString() !== req.user.id) {
                    cb(factory.buildError(res, 401, 'User not authorized'), null, userId);
                    return true;
                }
                cb(null, res.status(200).json({ msg: `${name} removed`}), userId);
            } catch (err) {
                if(err.kind === 'ObjectId') {
                    cb(factory.buildError(res, 404, `${name} not found`), null, userId);
                    return false;
                } else {
                    cb(factory.buildError(res, 500, 'Server Error'), null, userId);
                    return false;
                }
            }
        }
    };

    
};

module.exports = baseProvider;