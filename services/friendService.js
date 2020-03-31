const User = require('../models/User');
const Friend = require('../models/Friend');
const Transaction = require('../utils/Transaction');
const factory = require('../utils/ErrorFactory');
const baseProvider = require('./baseService');


class friendProvider extends baseProvider{

    constructor() {
        super();
    }

    

    async postFriend(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const session = await Transaction.startTransaction();
            const recipient = req.body.recipient;
            const requesterUser = await User.findById(req.user.id).select('-password');
            if (recipient) {
    
                const recipientUser = await User.findOne({username: recipient}); //recipient's username
    
                if (!recipientUser){
                    cb(factory.buildError(res, 400, 'Username doesn\'t exist'), null, userId);
                    return false;
                }
                const firstFriend = await Friend.findOne({
                    requester: requesterUser.id,
                    recipient: recipientUser.id,
                })
                const secondFriend = await Friend.findOne({
                    requester: requesterUser.id,
                    recipient: recipientUser.id,
                    
                })
                if (!firstFriend && !secondFriend) {
    
                    const newFriend = new Friend ({
                        requester: requesterUser.id,
                        recipient: recipientUser.id,
                        status: 1,
                    });
    
                    const newFriendSecond = new Friend ({
                        requester: recipientUser.id,
                        recipient: requesterUser.id,
                        status: 2,
                    });
    
                    const friendArray = [newFriend, newFriendSecond];
                    Friend.insertMany(friendArray);

                    let bulk = Friend.collection.initializeOrderedBulkOp();
                    bulk.find({ _id: requesterUser.id }).updateOne({ 
                        "$push": { friend: newFriendSecond.id }
                    });
                    bulk.find({ _id: recipientUser.id }).updateOne({ 
                        "$push": { friend: newFriendSecond.id }
                    });

                    bulk.execute(function(err, r) {
                        bulk = Friend.collection.initializeOrderedBulkOp();
                    });

                    Transaction.endTransaction(session);
                    cb(null, res.status(200).json(friendArray), userId);
                    return true;
    
                } else {
                    cb(factory.buildError(res, 400, 'Friend already exists'), null, userId);
                    return false;
                }
                
            } else {
                cb(factory.buildError(res, 400, 'Recipient user not found'), null, userId);
                return false;
            }
            
            
        } catch(err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    }

    async acceptFriend(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const session = await Transaction.startTransaction();
            const requester = req.body.requester;
            const recipientUser = await User.findById(req.user.id).select('-password');
            if (requester) {
    
                const requesterUser = await User.findOne({username: requester}); //requester's username
                
                if (!requesterUser){
                    cb(factory.buildError(res, 400, 'Username doesn\'t exist'), null, userId);
                    return false;
                }
                const firstFriend = await Friend.findOne({
                    requester: requesterUser.id,
                    recipient: recipientUser.id,
                })
                const secondFriend = await Friend.findOne({
                    requester: requesterUser.id,
                    recipient: recipientUser.id,
                    
                })
                const friendArray = [firstFriend, secondFriend];
            
                if (!firstFriend && !secondFriend) { //not possible
                    cb(factory.buildError(res, 500, 'Friend request was not found'), null, userId);
                    return false;
    
                } else {
    
                    let bulk = Friend.collection.initializeOrderedBulkOp();
                    bulk.find({ requester: requesterUser.id, recipient: recipientUser.id }).updateOne({ 
                        "$set": { status: 3 }
                    });
                    bulk.find({ recipient: requesterUser.id, requester: recipientUser.id }).updateOne({ 
                        "$set": { status: 3 }
                    });

                    bulk.execute(function(err, r) {
                        bulk = Friend.collection.initializeOrderedBulkOp();
                    });
    
                }
                Transaction.endTransaction(session);
                cb(null, res.status(200).json(friendArray), userId);
                return true;
                
            } else {
                cb(factory.buildError(res, 400, 'Requester must be provided'), null, userId);
                return false;
            }
    

    
        } catch(err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        }
    };

    async rejectFriend(req, res, cb) {
        try {
            const userId = (req.user.id) ? req.user.id : null;
            const session = await Transaction.startTransaction();
            const requester = req.body.requester;
            const recipientUser = await User.findById(req.user.id).select('-password');
    
            if (requester) {
    
                const requesterUser = await User.findOne({username: requester}); //requester's username
    
                if(!requesterUser){
                    cb(factory.buildError(res, 400, 'Username doesn\'t exist'), null, userId);
                    return false;
                    
                }
                const firstFriend = await Friend.findOne({
                    requester: requesterUser.id,
                    recipient: recipientUser.id,
                })
                const secondFriend = await Friend.findOne({
                    requester: requesterUser.id,
                    recipient: recipientUser.id,
                    
                })

                if (!firstFriend && !secondFriend) {
                    cb(factory.buildError(res, 500, 'Friend request was not found'), null, userId);
                    return false;
    
                } else {
    
                    const docA = await Friend.findOneAndRemove(
                        { requester: requesterUser.id, recipient: recipientUser.id }
                    )
                    const docB = await Friend.findOneAndRemove(
                        { recipient: requesterUser.id, requester: recipientUser.id }
                    )

                    let bulk = Friend.collection.initializeOrderedBulkOp();
                    bulk.find({ _id: requesterUser.id }).updateOne({ 
                        "$pull": { friends: docA._id }
                    });
                    bulk.find({ _id: recipientUser.id }).updateOne({ 
                        "$pull": { friends: docB._id }
                    });
                    bulk.execute(function(err, r) {
                        bulk = Friend.collection.initializeOrderedBulkOp();
                    });
    
                }
            } else {
                cb(factory.buildError(res, 400, 'Requester must be provided'), null, userId);
                return false;
            }
            
    
            Transaction.endTransaction(session);
            cb(null, res.status(200).json({ msg: 'Friendship rejected'}), userId);
            return true;
    
        } catch(err) {
            cb(factory.buildError(res, 500, 'Server Error'), null, userId);
            return false;
        } 
    };

};

module.exports = new friendProvider();