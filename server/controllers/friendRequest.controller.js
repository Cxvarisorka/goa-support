// Models (მონაცემთა ბაზის სექცია)
const FriendRequest = require("../models/friendRequest.model.js");

// მეგობრობის მოთხოვნის გაგზავნა
const sendFriendRequest = async (req, res) => {
    try {
        const {receiverId} = req.body;
        const senderId = req.user._id;

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
            // ვირჩევთ სტატუს მიმიდინარეს/დადასტურებულს რადგან შევამოწმოტ არის თუ არა გაგზავნილი მეგობრობა ან არიან თუ არა უკვე მეგობრები
            status: { $in: ['pending', 'accepted'] }
        })

        // თუ მოთხოვნა არსებობს ანუ ან მიმდინარე პროცესშია ან დადასტურებული
        if(existingRequest) return res.status(400).json("მეგობრობის მოტხოვნა უკვე არსებობს ან უკვე ხართ მეგობრები!");

        // შევქმნათ მეგობრობის მოტხოვნა თუ არ არსებობს
        const friendRequest = new FriendRequest({ senderId, receiverId });

        // შევინახოთ მონაცემთა ბაზაში
        await friendRequest.save();

        // დავაბრუნოთ წარმატების მესიჯი
        res.status(201).json("მეგობრობის მოთხოვნა წარმატებით გაუგზავნა!");
    } catch(err) {
        res.status(500).json(err.message);
    }
}

module.exports = {sendFriendRequest};