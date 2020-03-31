const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const FriendSchema = new mongoose.Schema({
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    status : {
        type: Number,
        enums: [
            0, //default
            1, //requested
            2, //pending
            3, //friends
        ]
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = User = mongoose.model('friend', FriendSchema)