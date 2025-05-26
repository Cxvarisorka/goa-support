const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                    // მხოლოდ ქართული ასოები და ერთი space (მაგ. ლუკა ცხვარაძე)
                    return /^[ა-ჰ]+\s[ა-ჰ]+$/.test(v);
                },
            message: props => `${props.value} არ არის ვალიდური სახელი და გვარი (მაგ: ლუკა ცხვარაძე)`
        }
    },

    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 10,
        validate: {
            validator: function (v) {
            // მხოლოდ ინგლისური ასოები და რიცხვები
                return /^[a-zA-Z0-9]+$/.test(v);
            },
            message: props => `${props.value} უნდა შეიცავდეს მხოლოდ ინგლისურ სიმბოლოებს და რიცხვებს`
        }
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
    isVerified: { 
        type: Boolean,
        default: false
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
