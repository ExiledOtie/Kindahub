const pool = require("../config/db");

const AnnouncementModel = {
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
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
      data.type || "meeting",
      data.created_by,
    ];

    const { rows } = await pool.query(query, values);

    return rows[0];
  },

async getAllAnnouncements() {
  const query = `
    SELECT
      a.*,
      g.name AS group_name,
      CASE
        WHEN a.announcement_date < CURRENT_DATE
        THEN 'completed'
        ELSE a.status
      END AS computed_status
    FROM announcements a
    LEFT JOIN groups g
      ON a.group_id = g.id
    ORDER BY a.announcement_date ASC
  `;

  const { rows } = await pool.query(query);

  return rows;
},

  async getGroupAnnouncements(groupId) {
    const query = `
      SELECT
        a.*,
        g.name AS group_name
      FROM announcements a
      LEFT JOIN groups g
        ON a.group_id = g.id
      WHERE a.group_id = $1
      ORDER BY a.announcement_date ASC
    `;

    const { rows } = await pool.query(query, [groupId]);

    return rows;
  },

  async getUpcomingMeeting(groupId) {
    const query = `
      SELECT *
      FROM announcements
      WHERE group_id = $1
      AND announcement_date >= CURRENT_DATE
      ORDER BY announcement_date ASC
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [groupId]);

    return rows[0];
  },

  async getUpcomingAnnouncement() {
    const query = `
      SELECT
        a.*,
        g.name AS group_name
      FROM announcements a
      LEFT JOIN groups g
        ON a.group_id = g.id
      WHERE a.announcement_date >= CURRENT_DATE
      ORDER BY a.announcement_date ASC
      LIMIT 1
    `;

    const { rows } = await pool.query(query);

    return rows[0];
  },

  async deleteAnnouncement(id) {
    const query = `
      DELETE FROM announcements
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0];
  },
};

module.exports = AnnouncementModel;