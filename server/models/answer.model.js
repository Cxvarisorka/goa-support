const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        fullname: {
            type: String,
            required: true
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
