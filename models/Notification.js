const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster queries
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Can be null for system notifications
    },
    type: {
      type: String,
      required: true,
      enum: [
        "PROJECT_INVITE",
        "PROJECT_REMOVED",
        "PROJECT_UPDATED",
        "PROJECT_DELETED",
        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_DELETED",
        "TODO_ADDED",
        "TODO_ASSIGNED",
        "TODO_COMPLETED",
        "ALL_TODOS_COMPLETED",
      ],
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    // Related entities
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    // Status
    isRead: {
      type: Boolean,
      default: false,
      index: true, // Index for faster unread queries
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Additional metadata
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Auto-delete notifications older than 30 days (optional cleanup)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
