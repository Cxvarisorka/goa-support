// utils/sendVerificationEmail.js
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Models
const VerificationToken = require('../models/token.model.js');

const sendVerificationEmail = async (user) => {
    // შევქმენით ტოკენი, რომელიც ყველა ახალი მომხმარებლისთვის იქნება უნიკალური
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 წუთი მილიწამებში

    await VerificationToken.create({
        userId: user._id,
        token,
        expiresAt
    });

    // შევქმენით დამადასტურებელი ლინკი, რომელზეც დაწკაპების შედეგად დადასტურდება აქაუნთი
    const link = `${process.env.SERVER_URL}/user/verify-email?token=${token}`;

    // ტრანსპორტერი არის საშუალება რომლითაც გვსურს გაგზავნა (gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // sendMail არის ასინქრონიზირებული მეთოდი რომლითაც უკვე ემაილზე იგზავნება მესიჯი
    await transporter.sendMail({
        from: `"Goa Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Verify your email address',
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px; text-align: center;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
                <h2 style="color: #333;">Welcome to <span style="color: #4CAF50;">Goa Website</span>!</h2>
                <p style="color: #555; font-size: 16px;">Thank you for registering. Please verify your email address by clicking the button below:</p>
                <a href="${link}" style="display: inline-block; margin-top: 20px; padding: 12px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Verify Email
                </a>
                <p style="margin-top: 30px; font-size: 14px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #bbb;">&copy; ${new Date().getFullYear()} Goa Support. All rights reserved.</p>
            </div>
        `
        });

};

module.exports = sendVerificationEmail;
