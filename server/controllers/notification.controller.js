// Models (მონაცემთა ბაზის სექცია)
const Notification = require("../models/notification.model.js");
const User = require("../models/user.model.js");

// მომხმარებლის ყველა შეტყობინების მიღება
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { isRead } = req.query;

        // Query ობიექტის შექმნა
        const query = { user: userId };

        // თუ isRead არის განსაზღვრული, ვამატებთ query-ში
        if (isRead !== undefined) {
            // isRead შეიძლება იყოს სტრიქონი "true" ან "false", გადავაკეთოთ ბულინად
            query.isRead = isRead === 'true';
        }

        // შეტყობინებების მოძებნა და დალაგება ბოლო დამატებულებით
        const notifications = await Notification.find(query).sort({ createdAt: -1 });

        console.log(notifications)

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json("შეცდომა შეტყობინებების მიღებისას");
    }
};

// მომხმარებლის ერთი კონკრეტული შეტყობინების წამოღება
const getNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const notification = await Notification.findById(notificationId);

        if(!notification) res.status(404).json("შეტყობინება ვერ მოიძებნა");

        if(notification.user.toString() !== userId) res.status(403).json("თქვენ არ შეგიძლიათ ამ შეტყობინების წაკითხვა");

        const from = await User.findById(notification.from).select("-password -updatedAt -__v");

        notification.isRead = true;

        await notification.save();

        notification.from = from;

        res.status(200).json(notification);
    } catch(err) {
        res.status(500).json("შეტყობინების წამოღებისას დაფიქსირდა შეცდომა");
    }
}

// მოვნიშნოთ ზარი წაკიტხულად
// const markSeen = async (req, res) => {
//     try {
//         // შეტყობინების ID
//         const id = req.params.id;
//         const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
//         res.status(200).json(updated);
//     } catch(err) {
//         res.status(500).json("შეცდომა შეტყობინების წაკითხვისას")
//     }
// }

// შეტყობინების წაშლა
const deleteOne = async (req, res) => {
    try {
        // შეტყობინების აიდი
        const id = req.params.id;

        if(!id) return res.status(400).json("შეტყობინების ID აუცილებელია");

        // ვპოულობთ შეტყობინებას
        const notification = await Notification.findById(id);

        if(!notification) res.status(404).json("შეტყობინება ვერ მოიძებნა!");

        // ვამოწმებთ შეუძლია თუ არა მომხმარებელს წაშლა
        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json("არ გაქვთ წვდომა ამ შეტყობინების წასაშლელად");
        }

        // ვცდილობთ მოვძებნოთ და წავშალოთ შეტყობინება
        const deletedNotification = await Notification.findByIdAndDelete(id);

        // თუ შეტყობინება ვერ მოიძებნა
        if (!deletedNotification) {
            return res.status(404).json("შეტყობინება ვერ მოიძებნა ან უკვე წაშლილია");
        }

        // ვაბრუნებთ წარმატების შეტყობინებას
        res.status(200).json("შეტყობინება წარმატებით წაიშალა");
    } catch(err) {
        res.status(500).json("შეტყობინების წაშლისას დაფიქსირდა შეცდომა")
    }
}

// ყველა შეტყობინების წაშლა
const deleteAll = async (req, res) => {
    try {
        // მომხმარებლის აიდი
        const user = req.user.id;

        // წაშალე ყველა შეტყობინება, რომელიც ეკუთვნის ამ მომხმარებელს
        const result = await Notification.deleteMany({user});

        console.log(result, "res")

        res.status(200).json(`${result.deletedCount} შეტყობინება წარმატებით წაიშალა`);
    } catch(err) {
        res.status(500).json("შეტყობინებების წაშლისას დაფიქსირდა შეცდომა");
    } 
}


module.exports = {getNotifications, getNotification, deleteOne, deleteAll};