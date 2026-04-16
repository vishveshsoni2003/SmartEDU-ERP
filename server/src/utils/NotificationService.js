import Notification from "../models/Notification.js";

/**
 * Service to dispatch internal DB notifications
 * @param {Object} options 
 * @param {String} options.institutionId
 * @param {String} options.userId User receiving the notification
 * @param {String} options.title
 * @param {String} options.message
 * @param {String} [options.type="INFO"] "INFO", "ALERT", "APPROVAL", "REMINDER"
 */
export const sendNotification = async ({ institutionId, userId, title, message, type = "INFO" }) => {
    try {
        await Notification.create({
            institutionId,
            userId,
            title,
            message,
            type
        });
    } catch (error) {
        console.error("Notification Service failed to create notification:", error.message);
    }
};
