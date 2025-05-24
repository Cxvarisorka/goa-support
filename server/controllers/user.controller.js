// Models (მონაცემთა ბაზის სექცია)
const User = require("../models/user.model.js");
const VerificationToken = require("../models/token.model.js");

// Utilities (დამხმარე ფუნქციები)
const hashPassword = require("../utils/passwordHashing.js");
const sendVerificationEmail = require("../utils/sendVerificationEmail.js");

// საჭირო მოდულები
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// მომხმარებლის რეგისტრაცია
const register = async (req, res) => {
    try {
        const {fullname, email, password} = req.body;
        
        // ვამოწმებთ არსებობს თუ არა, მომმხრაბელის მიერ შემოტანილი იმეილით შექმნილი აქაუნთი
        const userExsist = await User.findOne({email});
        console.log(userExsist)

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
            password: hashedPassword,
            role: "user",
            isVerified: false
        });

        await user.save();
        
        // შექმენის შემდეგ გავაგზავნოთ იმეილზე ლინკი რომელიც დაადასტურებს რომ აქაუნთი ეკუთვნის ადამიანს

        await sendVerificationEmail(user);

        res.status(201).json("რეგისტრაცია წარმატებით დასრულდა.")
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

        res.status(200).json({
            id: user._id,
            email: user.email,
            fullname: user.fullname, 
            role: user.role,
            isVerified: user.isVerified
        });

    } catch (err) {
        res.status(500).json(err.message);
    }
};

// მომცმსრებლის პროფილის ინფორმაცია
const profile = async (req, res) => {
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


module.exports = {register, login, logout, verifyEmail, profile, changePassword};