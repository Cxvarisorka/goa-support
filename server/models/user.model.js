const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'user'],
        default: 'user'
    },
    isVerified: { // როდესაც მომმხრაბელეი გაივლის რეგისტრაციას, იმეილზე მიუვა კოდი (სანამ არ დაადასტურებს იქამდე შეუძლებელი იქნება აქაუნთზე შესვლა)
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
