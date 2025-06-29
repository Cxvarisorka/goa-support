const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const Question = require("../models/question.model");
const Answer = require("../models/answer.model");

// პასუხის დამატება და შეტყობინება კითხვის ავტორს
const addAnswer = async (req, res) => {
    try {
        const { content } = req.body; // კითხვაზე პასუხის ტექსტი და ავტორის აიდი
        const { questionId } = req.params;
        const author = req.user.id;

        const question = await Question.findById(questionId);

        if(!question) return res.status(404).json("შეკითხვა ვერ მოიძებნა!");

        // მოგვაქვს პასუხის ავტორი
        const sender = await User.findById(author).select("-password -updatedAt -__v");

        const newAnswer = new Answer({
            content,
            author,
            fullname: sender.fullname,
            profileImg: sender.profileImg,
            question: questionId
        });

        await newAnswer.save();

        question.answers.push(newAnswer._id);

        await question.save();

        // ვეძებთ მიმღეს online მომხმარებლების მასივში
        const receiverSocketId = req.onlineUsers.get(question.author);

        // თუ კითხვაზე პასუხის მიმღები ონლაინ არის და ავტორი სხვაა
        if (receiverSocketId && question.author.toString() !== author.toString()) {
            req.io.to(receiverSocketId).emit("answerReceived", {
                from: sender,
                message: "თქვენს კითხვას დაემატა პასუხი",
                answer: newAnswer
            });
        }

        // ვქმნით შეტყობინებას (მხოლოდ თუ სხვა პასუხობს)
        if (question.author.toString() !== author.toString()) {
            await Notification.create({
                user: question.author,
                from: author,
                type: "info",
                message: `${sender.username} უპასუხა თქვენს კითხვას`
            });
        }


        res.status(201).json(newAnswer);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// პასუხის წაშლა
const deleteAnswer = async (req, res) => {
    try {
        const { id } = req.params; // მოსაშლელი პასუხის აიდი
        const userId = req.user.id; // იუზერის აიდი

        const answer = await Answer.findById(id);

        if (!answer) {
            return res.status(404).json({ error: "პასუხი ვერ მოიძებნა" });
        }

        // მხოლოდ ავტორს შეუძლია წაშლა
        if (answer.author.toString() !== userId) {
            return res.status(403).json("არ გაქვთ წაშლის უფლება");
        }

        await Answer.findByIdAndDelete(id); // წაშლა
        res.json("პასუხი წარმატებით წაიშალა");
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// პასუხის რედაქტირება
const editAnswer = async (req, res) => {
    try {
        const { id } = req.params; // პასუხის აიდი
        const { content } = req.body; // ახალი ტექსტი
        const userId = req.user.id;

        const answer = await Answer.findById(id);

        if (!answer) {
            return res.status(404).json("პასუხი ვერ მოიძებნა");
        }

        if (answer.author.toString() !== userId) {
            return res.status(403).json("არ გაქვთ რედაქტირების უფლება");
        }

        answer.content = content;
        await answer.save();

        res.json(answer);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// პასუხების დაბრუნება
const getAnswers = async (req, res) => {
    try {
        const {questionId} = req.params;

        if(!questionId) return res.status(400).json('შეკიტხვის ID აუცილებელია');

        const answers = await Answer.find({question: questionId});

        res.status(200).json(answers);
    } catch(err) {
        res.status(500).json(err.message);
    }
}

// მოწონება / მოუწონება და შეტყობინება პასუხის ავტორს
const toggleLike = async (req, res) => {
    try {
        const { id } = req.params; // პასუხის აიდი
        const userId = req.user.id;

        const answer = await Answer.findById(id).populate("author", "-password -updatedAt -__v");
        if (!answer) {
            return res.status(404).json({ error: "პასუხი ვერ მოიძებნა" });
        }

        const alreadyLiked = answer.likes.includes(userId);

        if (alreadyLiked) {
            answer.likes.pull(userId);
        } else {
            answer.likes.push(userId);

            // თუ ახალი მოწონებაა, ვუგზავნით შეტყობინებას პასუხის ავტორს
            const receiverId = answer.author._id;
            const sender = await User.findById(userId).select("-password -updatedAt -__v");

            const receiverSocketId = req.onlineUsers.get(receiverId.toString());

            if (receiverSocketId) {
                req.io.to(receiverSocketId).emit("answerLiked", {
                    from: sender,
                    message: "ვიღაცამ მოიწონა თქვენი პასუხი",
                    answerId: answer._id
                });
            }

            await Notification.create({
                user: receiverId,
                from: userId,
                type: "info",
                message: `${sender.username}-მ მოიწონა თქვენი პასუხი`
            });
        }

        await answer.save();

        res.json({
            message: alreadyLiked ? "მოწონება მოცილდა" : "მოწონება დაემატა",
            likes: answer.likes.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addAnswer,
    deleteAnswer,
    editAnswer,
    getAnswers,
    toggleLike,
};
