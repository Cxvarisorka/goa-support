const express = require("express");

// controllers
const { getNotifications, getNotification, deleteOne, deleteAll } = require("../controllers/notification.controller.js");

// middlewares
const verifyToken = require("../middlewares/auth.js");


const notificationRouter = express.Router();

notificationRouter.get("/all", verifyToken, getNotifications);
notificationRouter.delete("/all", verifyToken, deleteAll);
notificationRouter.get("/:id", verifyToken, getNotification);
notificationRouter.delete("/:id", verifyToken, deleteOne);


module.exports = notificationRouter;