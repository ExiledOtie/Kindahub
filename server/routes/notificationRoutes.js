const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
} = require("../controllers/notificationController");

router.use(authMiddleware);

router.get("/", getNotifications);

router.get(
  "/unread-count",
  getUnreadCount
);

router.put(
  "/:id/read",
  markNotificationAsRead
);

router.put(
  "/read-all",
  markAllNotificationsAsRead
);

router.delete(
  "/:id",
  removeNotification
);

console.log("authMiddleware:", typeof authMiddleware);
console.log("getNotifications:", typeof getNotifications);
console.log("getUnreadCount:", typeof getUnreadCount);
console.log("markNotificationAsRead:", typeof markNotificationAsRead);
console.log("markAllNotificationsAsRead:", typeof markAllNotificationsAsRead);
console.log("removeNotification:", typeof removeNotification);


module.exports = router;