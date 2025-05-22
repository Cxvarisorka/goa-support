const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);

module.exports = VerificationToken;
