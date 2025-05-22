const express = require("express");

// controllers
const { register, verifyEmail, login, profile, changePassword } = require("../controllers/user.controller.js");

// middlewares
const verifyToken = require("../middlewares/auth.js");

const userRouter = express.Router();

userRouter.post("/register", express.json(), register);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/login", express.json(), login);
userRouter.get("/profile", verifyToken, profile);
userRouter.post("/change-password", verifyToken, express.json(), changePassword);

module.exports = userRouter;