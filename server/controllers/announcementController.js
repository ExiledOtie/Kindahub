const AnnouncementModel = require(
  "../models/announcementModel"
);

// ======================================
// Create Announcement
// ======================================
exports.createAnnouncement = async (
  req,
  res
) => {
  try {
    const created_by = req.user.id;

    const {
      group_id,
      title,
      description,
      announcement_date,
      meeting_time,
      venue,
      host,
      type,
    } = req.body;

    const announcement =
      await AnnouncementModel.createAnnouncement({
        group_id,
        title,
        description,
        announcement_date,
        meeting_time,
        venue,
        host,
        type,
        created_by,
      });

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error(
      "Create announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create announcement",
    });
  }
};

// ======================================
// Get Group Announcements
// ======================================
exports.getGroupAnnouncements =
  async (req, res) => {
    try {
      const { groupId } = req.params;

      const announcements =
        await AnnouncementModel.getGroupAnnouncements(
          groupId
        );

      res.status(200).json({
        success: true,
        data: announcements,
      });
    } catch (error) {
      console.error(
        "Get announcements error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch announcements",
      });
    }
  };

// ======================================
// Get Upcoming Meeting
// ======================================
exports.getUpcomingMeeting =
  async (req, res) => {
    try {
      const { groupId } = req.params;

      const meeting =
        await AnnouncementModel.getUpcomingMeeting(
          groupId
        );

      res.status(200).json({
        success: true,
        data: meeting,
      });
    } catch (error) {
      console.error(
        "Get upcoming meeting error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch meeting",
      });
    }
  };

// ======================================
// Delete Announcement
// ======================================
exports.deleteAnnouncement =
  async (req, res) => {
    try {
      const { id } = req.params;

      const announcement =
        await AnnouncementModel.deleteAnnouncement(
          id
        );

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message:
            "Announcement not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Announcement deleted",
      });
    } catch (error) {
      console.error(
        "Delete announcement error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete announcement",
      });
    }
  };