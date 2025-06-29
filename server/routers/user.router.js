const express = require("express");

// controllers
const { register, verifyEmail, login, myProfile, changePassword, logout, searchUser, userProfile, uploadProfileImage } = require("../controllers/user.controller.js");

// middlewares
const verifyToken = require("../middlewares/auth.js");
const upload = require("../middlewares/multer.js");

const userRouter = express.Router();

userRouter.post("/register", express.json(), register);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/login", express.json(), login);
userRouter.get("/my-profile", verifyToken, myProfile);
userRouter.post('/change-profile-img', verifyToken, upload.single('image'), uploadProfileImage);
userRouter.post("/change-password", verifyToken, express.json(), changePassword);
userRouter.post("/logout", verifyToken, logout);
userRouter.get("/search", verifyToken, searchUser);
userRouter.get("/profile/:userId", verifyToken, userProfile);

module.exports = userRouter;