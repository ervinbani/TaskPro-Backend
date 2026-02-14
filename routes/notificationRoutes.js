const express = require("express");
const router = express.Router();
const {
  getUnreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

// All notification routes require authentication
router.use(protect);

// Get unread count (for badge) - must be before /:id routes
router.get("/unread/count", getUnreadCount);

// Get all notifications
router.get("/", getNotifications);

// Mark all as read - must be before /:id routes
router.put("/mark-all-read", markAllAsRead);

// Clear all read notifications
router.delete("/clear-read", clearReadNotifications);

// Single notification operations
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
