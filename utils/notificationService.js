const Notification = require("../models/Notification");

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @param {ObjectId} data.recipient - User ID who receives the notification
 * @param {ObjectId} data.sender - User ID who triggered the notification (optional)
 * @param {String} data.type - Notification type
 * @param {String} data.message - Notification message
 * @param {ObjectId} data.project - Related project ID (optional)
 * @param {ObjectId} data.task - Related task ID (optional)
 * @param {Object} data.metadata - Additional data (optional)
 * @returns {Promise<Notification>}
 */
const createNotification = async ({
  recipient,
  sender = null,
  type,
  message,
  project = null,
  task = null,
  metadata = {},
}) => {
  try {
    // Don't create notification if sender is the same as recipient
    if (sender && sender.toString() === recipient.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      project,
      task,
      data: metadata,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Create notifications for multiple recipients
 * @param {Array<ObjectId>} recipients - Array of user IDs
 * @param {Object} data - Notification data (same as createNotification)
 * @returns {Promise<Array<Notification>>}
 */
const createNotifications = async (recipients, data) => {
  try {
    const notifications = await Promise.all(
      recipients.map((recipient) => createNotification({ ...data, recipient })),
    );

    return notifications.filter((n) => n !== null);
  } catch (error) {
    console.error("Error creating notifications:", error);
    return [];
  }
};

/**
 * Helper to get all members of a project (owner + collaborators)
 * excluding a specific user (usually the sender)
 * @param {Project} project - Project document
 * @param {ObjectId} excludeUserId - User ID to exclude
 * @returns {Array<ObjectId>}
 */
const getProjectMembers = (project, excludeUserId = null) => {
  const members = [project.owner, ...project.collaborators];

  if (excludeUserId) {
    return members.filter(
      (member) => member.toString() !== excludeUserId.toString(),
    );
  }

  return members;
};

module.exports = {
  createNotification,
  createNotifications,
  getProjectMembers,
};
