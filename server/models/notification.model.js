const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // sender (optional)
  type: {
    type: String,
    required: true,
    enum: ["info", "success", "reject"], // მხოლოდ ეს მნიშვნელობები დაიშვება
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
