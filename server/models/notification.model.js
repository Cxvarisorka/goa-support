import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // sender (optional)
  type: { type: String, required: true }, // e.g., "friend-request", "message", "alert"
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
