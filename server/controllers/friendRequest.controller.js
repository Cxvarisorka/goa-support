// Models (მონაცემთა ბაზის სექცია)
const FriendRequest = require("../models/friendRequest.model.js");
const Notification = require("../models/notification.model.js");
const User = require("../models/user.model.js");

// მეგობრობის მოთხოვნის გაგზავნა
const sendFriendRequest = async (req, res) => {
    try {
        const {receiverId} = req.params;
        const senderId = req.user.id;

        // ვამოწმებთ უგზავნის თუ არა მომხმარებელი თავისთავს მოთხოვნას
        if(receiverId === senderId) return res.status(400).json("თქვენ არ შეგიძლიათ გაუგზავნოთ მეგობრობა საკუთარ თავს!");

        // ვამოწმებთ არის თუ არა გაგზავნილი უკვე მოთხოვნა
        const existingRequest = await FriendRequest.findOne({
            // მოცემულია ორი პირობა
            $or: [
                // როცა გამგზავნი ხარ შენ და მიმღები ის
                { senderId, receiverId },
                // როცა გამგზავნი არის ის და მიმღები შენ
                { senderId: receiverId, receiverId: senderId }
            ],
        })

        // თუ მოთხოვნა არსებობს ანუ ან მიმდინარე პროცესშია ან დადასტურებული
        if(existingRequest) return res.status(400).json("მეგობრობის მოტხოვნა უკვე არსებობს ან უკვე ხართ მეგობრები!");

        // შევქმნათ მეგობრობის მოტხოვნა თუ არ არსებობს
        const friendRequest = new FriendRequest({ senderId, receiverId });

        // შევინახოთ მონაცემთა ბაზაში
        await friendRequest.save();

        // ვეძებთ მიმღებს online მომხმარებლების მასივში
        const receiverSocketId = req.onlineUsers.get(receiverId);

        // მოგვაქვს მეგობრობის გამომგზავნის ობიექტი ბაზიდან
        const sender = await User.findById(senderId).select("-password -updatedAt -__v");
        

        // თუ მიმღები ონლაინ არის ვიგზავნით მესიჯს
        if(receiverSocketId) {
            req.io.to(receiverSocketId).emit('friendRequestReceived', {
                from: sender,
                message: "თქვენ მიიღებთ ახალი მეგობრობის მოთხოვნა"
            });
        }

        // შეტყობინების შემქნა
        await Notification.create({
            user: receiverId,
            from: senderId,
            type: "info",
            message: `${sender.username} გამოგიგზავნათ მეგობრობის მოთხოვნა`
        });

        // დავაბრუნოთ წარმატების მესიჯი
        res.status(201).json("მეგობრობის მოთხოვნა წარმატებით გაუგზავნა!");
    } catch(err) {
        res.status(500).json(err.message);
    }
};

// გაგზავნილი მეგობრობის უარყოფა
const rejectFriendRequest = async (req, res) => {
    try {
        const receiverId = req.user.id;
        const { senderId } = req.params;

        // ვეძებთ მეგობრობის მოთხოვნას სადაც მიმღები ვართ ჩვენ და გამგზავნი არის senderId
        const request = await FriendRequest.findOne({
            senderId,
            receiverId,
        });

        // თუ მოთხოვნა ვერ მოიძებნა
        if (!request) {
            return res.status(404).json("მეგობრობის მოთხოვნა ვერ მოიძებნა ან უკვე განიხილულია.");
        }

        // წავშალოთ მოთხოვნა
        await FriendRequest.findByIdAndDelete(request._id);

        // მოძებნეთ გამგზავნის socket id
        const senderSocketId = req.onlineUsers.get(senderId);

        // მოგვაქვს მიმრების აქაუნთი
        const receiver = await User.findById(receiverId).select("-password -updatedAt -__v")

        // თუ გამგზავნი ონლაინაა, გაუგზავნეთ შეტყობინება
        if (senderSocketId) {
            req.io.to(senderSocketId).emit("friendRequestRejected", {
                from: receiver,
                message: "თქვენი მეგობრობის მოთხოვნა უარყოფილია"
            });
        }

        // შეტყობინების გაგზავნა
        await Notification.create({
            user: senderId,
            from: receiverId,
            type: "reject",
            message: `${receiver.username} უარყო თქვენი მეგობრობის მოთხოვნა`
        });


        res.status(200).json("მეგობრობის მოთხოვნა უარყოფილია.");
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// შემთხვევით გაგზავნილი მეგობრობის მოტხოვნის გაუქმება
const cancelFriendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;

        // ვეძებთ და ვშლით გაგაზავნილ მეგობრობის მოთხოვნას
        const deleted = await FriendRequest.findOneAndDelete({
            senderId,
            receiverId
        });

        // თუ მოთხოვნა ვერ ვიპოვეთ მაშინ ვაბრუნებთ ერორს
        if (!deleted) {
            return res.status(404).json("მიმდინარე მოთხოვნა ვერ მოიძებნა ან უკვე გაუქმდა.");
        }

        // ვაბრუნებთ წარმატების მესიჯს
        res.status(200).json("მეგობრობის მოთხოვნა გაუქმდა.");
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// გამოგზავნილი მეგობრობის მოთხოვნის დადასტურება
const acceptFirendRequest = async (req, res) => {
    try {
        const receiverId = req.user.id;
        const { senderId } = req.params;

        // ვამოწმებთ არსებობს თუ არა მეგობროპბის მოთხოვნა
        const exsist = await FriendRequest.findOneAndDelete({
            senderId,
            receiverId
        });

        // თუ მოთხოვნა არ არსებობს დავაბრუნოთ ერრორი
        if (!exsist) {
            return res.status(404).json("მიმდინარე მოთხოვნა ვერ მოიძებნა ან უკვე გაუქმდა.");
        }

        // თუ არსებობს ბაზაში ვეძებთ ორივე მომხმარებელს და ვცვლით friends (arr) კუთვნილებას 
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { friends: receiverId }
        });

        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { friends: senderId }
        });

        // ვაცოდინოთ მეგობრობის გამომგზავნს თუ ის არის ონლაინ
        const senderSocketId = req.onlineUsers.get(senderId);
        const receiver = await User.findById(receiverId).select("-password -updatedAt -__v");

        if (senderSocketId) {
            req.io.to(senderSocketId).emit("friendRequestAccepted", {
                from: receiver,
                message: "თქვენი მეგობრობის მოთხოვნა დადასტურდა"
            });
        }

        // შეტყობინების გაგზავნა
        await Notification.create({
            user: senderId,
            from: receiverId,
            type: "success",
            message: `${receiver.username} დადასტურა თქვენი მეგობრობის მოთხოვნა`
        });

        res.status(200).json("მეგობრობის მოთხოვნა წარმატებით დადასტურდა.");
        
    } catch(err) {
        res.status(500).json(err.message);
    }
}

// დადასტურებული მეგობრის წაშლა
const removeFriend = async (req, res) => {
    try {
        const userId = req.user.id; // ავტორიზებული მომხმარებლის ID
        const { friendId } = req.params; // მოსაშლელი მეგობრის ID

        // მოვძებნოთ მომხმარებლები
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        // თუ რომელიმე ვერ მოიძებნა
        if (!user || !friend) {
            return res.status(404).json("მომხმარებელი ვერ მოიძებნა!");
        }

        // წავშალოთ მეგობარი ორივე მხრიდან
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        // შევინახოთ ცვლილებები ბაზაში
        await user.save();
        await friend.save();

        // Socket.IO - ვპოულობთ წაშლილი მეგობრის socketId-ს
        const friendSocketId = req.onlineUsers.get(friendId);

        // ვიღებთ მომხმარებლის პროფილს შეტყობინებისთვის
        const removedBy = await User.findById(userId).select("-password -updatedAt -__v");

        // თუ წაშლილი მეგობარი ონლაინ არის, ვუგზავნით შეტყობინებას
        if (friendSocketId) {
            req.io.to(friendSocketId).emit("friendRemoved", {
                from: removedBy,
                message: "თქვენ წაგშალეს მეგობრებიდან"
            });
        }

        // შეტყობინების გაგზავნა
        await Notification.create({
            user: friendId,
            from: userId,
            type: "info",
            message: `${removedBy.username} წაგშალათ მეგობრებიდან`
        });

        // წარმატების მესიჯი
        res.status(200).json("მეგობარი წარმატებით წაიშალა!");
    } catch(err) {
        res.status(500).json(err.message);
    } 
};


module.exports = {sendFriendRequest, cancelFriendRequest, rejectFriendRequest, acceptFirendRequest, removeFriend};