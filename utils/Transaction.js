
const mongoose = require('mongoose');

let startTransaction  = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    return session;
};

let endTransaction  = async (session) => {
    await session.commitTransaction();
    session.endSession();
};

module.exports = { startTransaction, endTransaction };