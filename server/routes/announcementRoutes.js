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
  deleteAnnouncement,
} = require(
  "../controllers/announcementController"
);

// ======================================
// All routes protected
// ======================================

router.use(authMiddleware);

// ======================================
// Create Announcement
// ======================================

router.post(
  "/",
  authorizeRoles("super_admin"),
  createAnnouncement
);

// ======================================
// Get Group Announcements
// ======================================

router.get(
  "/group/:groupId",
  getGroupAnnouncements
);

// ======================================
// Get Upcoming Meeting
// ======================================

router.get(
  "/group/:groupId/upcoming",
  getUpcomingMeeting
);

// ======================================
// Delete Announcement
// ======================================

router.delete(
  "/:id",
  authorizeRoles("super_admin"),
  deleteAnnouncement
);

module.exports = router;