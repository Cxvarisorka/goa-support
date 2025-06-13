const Message = require("../models/message.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

// მესიჯიჯს გაგზავნის ფუნქცია
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;
        const {text} = req.body;

        console.log(senderId, receiverId, text)

        if (!senderId || !receiverId || !text) {
            return res.status(400).json('ყველა ველი აუცილებელია');
        }

        const message = await Message.create({ senderId, receiverId, text });

        // ვაცოდინოთ მესიჯის მიმღებს თუ არის ის ონლაინ
        const receiverSocketId = req.onlineUsers.get(receiverId);
        const receiver = await User.findById(receiverId).select("-password -updatedAt -__v");

        console.log(receiverSocketId, receiver)
        
        if (receiverSocketId) {
            req.io.to(receiverSocketId).emit("message", {
                from: receiver,
                text: message.text,
                createdAt: message.createdAt,
                senderId: senderId
            });

        }
        
        // შეტყობინების გაგზავნა
        await Notification.create({
            user: receiverId,
            from: senderId,
            type: "success",
            message: `${receiver.username} გამოგიგზავნათ მესიჯი`
        });
        
        res.status(200).json(message);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// მესიჯების მიღება
const getMessages = async (req, res) => {
    try {
        const user = req.user.id;
        const {friendId} = req.params;

        if(!friendId) return res.status(403).json("გამომგზავნის ID აუცილებელია!");

        const messages = await Message.find({
            $or: [
                { senderId: user, receiverId: friendId },
                { senderId: friendId, receiverId: user }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch(err) {
        res.status(500).json(err.message);
    }
}


module.exports = {sendMessage, getMessages};