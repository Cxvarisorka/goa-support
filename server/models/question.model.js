const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            require: true,
            default: ''
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        answers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Answer"
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
