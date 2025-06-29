// Models (მონაცემთა ბაზის სექცია)
const User = require("../models/user.model.js");
const VerificationToken = require("../models/token.model.js");
const FriendRequest = require("../models/friendRequest.model.js");

// Utilities (დამხმარე ფუნქციები)
const hashPassword = require("../utils/passwordHashing.js");
const sendVerificationEmail = require("../utils/sendVerificationEmail.js");

// საჭირო მოდულები
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const imageUpload = require("../utils/uploadImage.js");
const deleteImage = require("../utils/deleteImage.js");


// მომხმარებლის რეგისტრაცია
const register = async (req, res) => {
    try {
        const {fullname, email, password, username} = req.body;
        
        // ვამოწმებთ არსებობს თუ არა, მომმხრაბელის მიერ შემოტანილი იმეილით შექმნილი აქაუნთი
        const userExsist = await User.findOne({email});

        // თუ არსებობს დავაბრუნებთ შეცდომას ტექსტით რომ იმეილი უკვე რეგისტრირებულია
        if (userExsist) {
            return res.status(400).json("იმეილი უკვე რეგისტრირებულია!");
        }

        // თუ არ არსებეობს, ჩვეულებრივად შევქმნით მომხმარებელს

        // ჯერ ვაკეთებთ პაროლის hashing
        const hashedPassword = await hashPassword(password);

        // შევქმნათ საბოლოოდ მომხმარებლის აქაუნთი
        const user = new User({
            email,
            fullname,
            username,
            password: hashedPassword,
            role: "user",
            isVerified: false
        });

        await user.save();
        
        // შექმენის შემდეგ გავაგზავნოთ იმეილზე ლინკი რომელიც დაადასტურებს რომ აქაუნთი ეკუთვნის ადამიანს

        await sendVerificationEmail(user);

        res.status(201).json("რეგისტრაცია წარმატებით დასრულდა, გთხოვთ დაადასტუროთ იმეილი, წინააღმდეგ შემთხვევაში ავტორიზაციას ვერ გაივლით!")
        
    } catch(err) {
        res.status(500).json(err.message);
    }
}

// მომხმარებლის იმეილის დადასტურება
const verifyEmail = async (req, res) => {
    try {
        const {token} = req.query;

        // დაცული ტოკენის გაშიფვრა
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ვეძებთ ბაზაში შენახულ ტოკენის ჩანაწერს
        const record = await VerificationToken.findOne({ userId: decoded.id, token });

        // თუ ჩანაწერი არ გვაქვს, ვაბრუნებთ ერორს
        if (!record) {
            return res.status(400).json("ტოკენი არასწორია ან ვადა გაუვიდა.");
        }

        // თუ ჩანაწერის (ტოკენის) დრო ამოიწურა ვშლით ტოკენს და ვაბრუნებთ ერორს
        if (record.expiresAt < new Date()) {
            await VerificationToken.deleteOne({ _id: record._id });
            return res.status(400).json("ტოკენის ვადა უკვე გასულია.");
        }

        // ტოკენიდან ამოღებული id_ით მომხმარებლის ძიება
        const user = await User.findById(decoded.id);

        // მოპმხმარებელი ვერ მოიძებნა
        if (!user) return res.status(400).json('რაღაც შეცდომაა, (Invalid Token)!');

        // მომხმარებელი უკვე დადასტურებულია (მაშინ წავშალოთ ტოკენის ჩანაწერი)
        if (user.isVerified) {
            return res.json('მომხმარებელი უკვე დადასტურებულია!');
        };

        // თუ ყველაფერმა კარგად ჩაიარა, დავადასტუროთ აქაუნთი
        user.isVerified = true;
        await user.save();

        // ვიპოვოთ და წავშალოთ ტოკენის ჩანაწერი რადგან აღარ გვჭირდება
        await VerificationToken.deleteOne({ _id: record._id }); // წავშალოთ გამოყენებული ტოკენი

        res.status(200).json("ელ-ფოსტა წარმატებით დადასტურდა!");
    } catch(err) {
        res.status(500).json(err.message);
    }
}

// მომხმარებლის ავტორიზაცია
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ვპოულობთ მომხმარებელს იმეილის გამოყენებით
        const user = await User.findOne({ email });

        // თუ ვერ იქნა ნაპოვნი, ვაბრუნებთ 404 ერორს
        if (!user) return res.status(404).json("მომხმარებელი ვერ მოიძებნა!");

        // თუ მომხმარებლის ექაუნთი არ არის დადასტურებული, არ მივეცთ შესვლის საშუალება
        if (!user.isVerified) return res.status(400).json("გთხოვთ დაადასტუროთ აქაუნთი!")

        // ვადარებთ მომხმარებლის მიერ რეგისტრირებულ პაროლს და შემოტანილ პაროლს
        const isMatch = await bcrypt.compare(password, user.password);

        // თუ არ დაემთხვა, ვაბრუნებთ 400 ერორს
        if (!isMatch) return res.status(400).json("პაროლი არასწორია!");

        // ყველაფრის წარმატებით დასრულების შემთხვევაში ვაბრუნებთ Token_ს

        // ვქმნით JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, // საჭირო ინფორმაცია ავტორიზაციისთვის
            process.env.JWT_SECRET, // საიდუმლო გასაღები, რომელსაც ვიყენებთ ტოკენის გასაშიფრად
            { expiresIn: '1d' } // დრო რომლის გასვლის შემთხვევაშიც, ტოკენი არა ვალიდური იქნება
        );

        // ვქმნით cookies უსაფრთხოებისთვის (dev)
        // res.cookie("loginToken", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "Strict",
        //     maxAge: 24 * 60 * 60 * 1000 // 1 day
        // });

        // ვქმნით cookies უსაფრთხოებისთვის (production)
        // res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
        // res.setHeader("Access-Control-Allow-Credentials", "true");

        res.cookie("loginToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        const retUser = await User.findById(user._id).select("-password -v");

        res.status(200).json(retUser);

    } catch (err) {
        console.log(err)
        res.status(500).json(err.message);
    }
};

// მომხმარებლის აქაუნთიდან გამოსვლა
const logout = async (req, res) => {
    try {
        // res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
        // res.setHeader("Access-Control-Allow-Credentials", "true");
        
        res.clearCookie("loginToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None"
        });


        res.json("აქაუნთიდან გამოსვლა წარმატებით შესრულდა");
    } catch(err) {
        res.status(500).json(err.message);
    }
}

// მომცმსრებლის პროფილის ინფორმაცია
const myProfile = async (req, res) => {
    try {
        // ვიპოვოთ მომხმარებელი ტოკენის აიდის მიხედვით და გამოვრიცხოთ პაროლი
        const user = await User.findById(req.user.id).select('-password');

        // თუ არ მოიძებნა დავაბრუნოთ ერორი
        if (!user) return res.status(401).json("ტოკენი არასწორია ან დრო გაუვიდა!");

        // თუ მოიძებნა დავაბრუნოთ მომხმარებლის ინფორმაცია
        res.json(user);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// მომხმარებლის პაროლის შეცვლა
const changePassword = async (req, res) => {
    try {
        const {currentPassword, changedPassword} = req.body;

        // ვეძებთ მომხმარებელს id_ის მიხედვით, რომელიც ინახება token ში.
        const user = await User.findById(req.user.id);

        // თუ მომხმარებელი ვერ მოიძებნა, ესეიგი token_ის პრობლემაა 
        if(!user) return res.status(400).json("Token_ის პრობლემაა, გთხოვთ სცადოთ მოგვიანებით!");
        
        // ვადარებთ მომხმარებლის მიერ რეგისტრირებულ პაროლს და შემოტანილ პაროლს
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        // თუ მომხმარებლის შემოტანიული პაროლი არ ემთხვევა რეგისტრირებულ პაროლს, დავაბრუნოთ ერორი.
        if(!isMatch) return res.status(401).json("პაროლი არასწორია!");

        // პაროლის უსაფრთხოებითვის დავშიფროთ
        const hashedPassword = await hashPassword(changedPassword);

        // საბოლოოდ კი შევინახოთ მომხმარებლის ახალი პაროლი მონაცემთა ბაზაში
        user.password = hashedPassword;

        await user.save();
        
        res.json("პაროლი წარმატებით შეიცვალა!");
    } catch(err) {
        res.status(500).json(err.message);
    }
}

// მომხმარებლის ძიება
const searchUser = async (req, res) => {
    try {
        // საძიებო სიტყვა
        const {q} = req.query;

        // ვამოწმებთ გვაქვს თუ არა საძიებო სიტყვა
        if(!q) return res.status(400).json("საძიებო სიტყვა (query) აუცილებელია!");

        // ვქმნით regex რომელიც გადმოცემული სიტყვით დასაწისიდანვე ეძებს
        const regex = new RegExp('^' + q, 'i');

        // ვეძებთ მომხმარებლებს fullname/username_ის გამოყენებით
        const users = await User.find({
            $or: [
                { fullname: regex },
                { username: regex }
            ]
        })
            .select("fullname username role _id")
            .limit(5);

        // თუ დაბრუნებული მასივი ცარიელია (ესეიგი ვერ მოიძებნა)
        if(users.length === 0) return res.status(404).json("მომხმარებელი ვერ მოიძებნა");

        // სხვა შემტხვევაში ვაბრუნებთ მასივს
        res.json(users);

    } catch(err) {
        res.status(500).json(err.message);
    }
}

// მოხმარებლის პროფილის ნახვა
const userProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const authUserId = req.user.id;

        if (!userId) return res.status(400).json("მომხმარებლის ID აუცილებელია!");

        const user = await User.findById(userId).select("-password -updatedAt -__v");
        if (!user) return res.status(404).json("მომხმარებლის მოძიება ვერ მოხერხდა!");


        let friendStatus = "none"; // default

         if (user.friends.includes(authUserId)) {
            friendStatus = "friends";
        } else {
            // 🔹 Otherwise, check for an active friend request
            const friendReq = await FriendRequest.findOne({
                $or: [
                    { senderId: authUserId, receiverId: userId },
                    { senderId: userId, receiverId: authUserId }
                ]
            });

            if (friendReq) {
                if (friendReq.senderId.toString() === authUserId) {
                    friendStatus = "request_sent";
                } else if (friendReq.receiverId.toString() === authUserId) {
                    friendStatus = "request_received";
                }
            }
        }

        res.status(200).json({ user, friendStatus });
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// პროფილის ფოტოს ატვირთვა
const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const image = req.file.path;


        const user = await User.findById(userId);

        const result = await imageUpload('profiles', image);

        if(user.profileImg) {
            user.images.push(user.profileImg);
        }

        user.profileImg = result.secure_url;

        await user.save();

        res.json('პროფილის ფოტოს ატვირთა წარმატებით შესრულდა!');
    } catch(err) {
        res.status(500).json(err.message);
    }
}


module.exports = {register, login, logout, verifyEmail, myProfile, changePassword, searchUser, userProfile, uploadProfileImage};