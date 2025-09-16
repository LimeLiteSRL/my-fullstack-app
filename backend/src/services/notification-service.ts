// services/notificationService.ts

import { Notification, type INotificationDocumentType } from "../models/models";
import { Types } from "mongoose";

// Create a new notification
export const createNotification = async (
  notificationData: Partial<INotificationDocumentType>
): Promise<INotificationDocumentType> => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

// Update a notification by ID
export const updateNotificationById = async (
  notificationId: Types.ObjectId,
  updateData: Partial<INotificationDocumentType>
): Promise<INotificationDocumentType | null> => {
  return await Notification.findByIdAndUpdate(notificationId, updateData, {
    new: true,
  });
};

// Delete a notification by ID
export const deleteNotificationById = async (
  notificationId: Types.ObjectId
): Promise<INotificationDocumentType | null> => {
  return await Notification.findByIdAndDelete(notificationId);
};

// Mark all current notifications as read for a user (up to the current moment)
export const markAllNotificationsAsRead = async (
  userId: Types.ObjectId
): Promise<void> => {
  await Notification.updateMany(
    { userId: userId, isRead: false, scheduledTime: { $lte: new Date() } }, // Only mark notifications up to the current time
    { isRead: true }
  );
};

export const markNotificationAsReadById = async (
  notificationId: Types.ObjectId
) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId },
    { isRead: true }
  );
};

export const getNotifications = async (
  userId: Types.ObjectId
): Promise<INotificationDocumentType[]> => {
  return await Notification.find({
    userId: userId,
    scheduledTime: { $lte: new Date() }, // Only get notifications created up to now
  })
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(20); // Limit to 20 results
};
