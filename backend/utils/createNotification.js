const Notification = require('../models/Notification');

/**
 * Create a notification document in the database
 *
 * @param {Object} params - Notification parameters
 * @param {string} params.user - User ID who receives the notification
 * @param {string} params.type - Notification type (e.g. 'bid_received', 'project_awarded', 'milestone_completed', 'payment', 'review', 'system')
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message body
 * @param {string} [params.link] - Optional link/URL associated with the notification
 * @param {string} [params.relatedUser] - Optional related user ID (e.g. who triggered the notification)
 * @param {string} [params.relatedProject] - Optional related project ID
 * @returns {Promise<Object>} Created notification document
 */
const createNotification = async ({
  user,
  type,
  title,
  message,
  link,
  relatedUser,
  relatedProject,
}) => {
  try {
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      link,
      relatedUser,
      relatedProject,
    });

    return notification;
  } catch (error) {
    // Log error but don't throw - notifications should not break main flow
    console.error('Error creating notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
