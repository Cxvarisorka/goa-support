const { sendMessage, getMessages } = require("../controllers/message.controller.js");
const verifyToken = require("../middlewares/auth.js");

const express = require('express');

const messageRouter = express.Router();

messageRouter.post('/:receiverId', express.json(), verifyToken, sendMessage);
messageRouter.get('/chat/:friendId', verifyToken, getMessages);

module.exports = messageRouter;