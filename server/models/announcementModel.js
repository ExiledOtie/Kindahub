const pool = require("../config/db");

const AnnouncementModel = {
  // ==========================
  // Create Announcement
  // ==========================
  async createAnnouncement(data) {
    const query = `
      INSERT INTO announcements (
        group_id,
        title,
        description,
        announcement_date,
        meeting_time,
        venue,
        host,
        type,
        created_by
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )
      RETURNING *
    `;

    const values = [
      data.group_id,
      data.title,
      data.description,
      data.announcement_date,
      data.meeting_time,
      data.venue,
      data.host,
      data.type,
      data.created_by,
    ];

    const { rows } = await pool.query(
      query,
      values
    );

    return rows[0];
  },

  // ==========================
  // Get Group Announcements
  // ==========================
  async getGroupAnnouncements(groupId) {
    const query = `
      SELECT
        a.*,
        u.fullname AS created_by_name
      FROM announcements a
      LEFT JOIN users u
        ON a.created_by = u.id
      WHERE a.group_id = $1
      ORDER BY a.announcement_date ASC
    `;

    const { rows } = await pool.query(
      query,
      [groupId]
    );

    return rows;
  },

  // ==========================
  // Get Upcoming Meeting
  // ==========================
  async getUpcomingMeeting(groupId) {
    const query = `
      SELECT *
      FROM announcements
      WHERE group_id = $1
      AND announcement_date >= CURRENT_DATE
      ORDER BY announcement_date ASC
      LIMIT 1
    `;

    const { rows } = await pool.query(
      query,
      [groupId]
    );

    return rows[0];
  },

  // ==========================
  // Delete Announcement
  // ==========================
  async deleteAnnouncement(id) {
    const query = `
      DELETE FROM announcements
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(
      query,
      [id]
    );

    return rows[0];
  },
};

module.exports = AnnouncementModel;