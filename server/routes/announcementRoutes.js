const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const authorizeRoles = require(
  "../middleware/roleMiddleware"
);

const {
  createAnnouncement,
  getGroupAnnouncements,
  getUpcomingMeeting,
  getUpcomingAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement,
  updateAnnouncementStatus
} = require(
  "../controllers/announcementController"
);

router.use(authMiddleware);

// Create
router.post(
  "/",
  authorizeRoles("super_admin"),
  createAnnouncement
);

// Get all announcements
router.get(
  "/",
  getAllAnnouncements
);

// Get next upcoming meeting
router.get(
  "/upcoming",
  getUpcomingAnnouncement
);

// Group announcements
router.get(
  "/group/:groupId",
  getGroupAnnouncements
);

// Group upcoming meeting
router.get(
  "/group/:groupId/upcoming",
  getUpcomingMeeting
);

router.put(
  "/:id/status",
  authorizeRoles("super_admin"),
  updateAnnouncementStatus
);

// Delete
router.delete(
  "/:id",
  authorizeRoles("super_admin"),
  deleteAnnouncement
);

module.exports = router;