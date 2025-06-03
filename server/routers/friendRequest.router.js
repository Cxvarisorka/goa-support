const express = require("express");

// controllers
const { sendFriendRequest, rejectFriendRequest, cancelFriendRequest, acceptFirendRequest, removeFriend } = require("../controllers/friendRequest.controller.js");

// middlewares
const verifyToken = require("../middlewares/auth.js");

const friendRequestRouter = express.Router();

friendRequestRouter.post("/add/:receiverId", verifyToken, sendFriendRequest);
friendRequestRouter.delete("/reject/:senderId", verifyToken, rejectFriendRequest);
friendRequestRouter.delete("/cancel/:receiverId", verifyToken, cancelFriendRequest);
friendRequestRouter.post("/accept/:senderId", verifyToken, acceptFirendRequest);
friendRequestRouter.delete("/remove/:friendId", verifyToken, removeFriend);

module.exports = friendRequestRouter;