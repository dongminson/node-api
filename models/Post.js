const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


const PostSchema = new Schema({
    user: {
            type : Schema.Types.ObjectId, 
            ref : 'user'
        
    },
    collaborators: [ 
        {
            type : Schema.Types.ObjectId, 
            ref : 'user'
        } 
    ],
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    like: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ],
    comment: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            text: {
                type: String,
                require: true
            },
            name: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
        

    ],
    date: {
        type: Date,
        default: Date.now 
    }

});

module.exports = Post = mongoose.model('post', PostSchema);