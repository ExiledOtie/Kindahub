const Notification = require("../models/notificationModel");

const getNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const notifications =
      await Notification.getUserNotifications(
        req.user.id,
        page,
        limit
      );

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count =
      await Notification.getUnreadCount(req.user.id);

    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch unread count",
    });
  }
};

const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.markAsRead(
        req.params.id,
        req.user.id
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update notification",
    });
  }
};

const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    await Notification.markAllAsRead(req.user.id);

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update notifications",
    });
  }
};

const removeNotification = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.deleteNotification(
        req.params.id,
        req.user.id
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete notification",
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
};