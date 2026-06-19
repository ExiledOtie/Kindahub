const db = require("../config/db");

const createNotification = async ({
  user_id,
  group_id = null,
  title,
  message,
  type,
  reference_id = null,
}) => {
  const query = `
    INSERT INTO notifications
    (
      user_id,
      group_id,
      title,
      message,
      type,
      reference_id
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *;
  `;

  const values = [
    user_id,
    group_id,
    title,
    message,
    type,
    reference_id,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const getUserNotifications = async (
  userId,
  page = 1,
  limit = 20
) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT *
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await db.query(query, [
    userId,
    limit,
    offset,
  ]);

  return result.rows;
};

const getUnreadCount = async (userId) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM notifications
    WHERE user_id = $1
    AND is_read = false
  `;

  const result = await db.query(query, [userId]);

  return Number(result.rows[0].count);
};

const markAsRead = async (notificationId, userId) => {
  const query = `
    UPDATE notifications
    SET is_read = true
    WHERE id = $1
    AND user_id = $2
    RETURNING *
  `;

  const result = await db.query(query, [
    notificationId,
    userId,
  ]);

  return result.rows[0];
};

const markAllAsRead = async (userId) => {
  const query = `
    UPDATE notifications
    SET is_read = true
    WHERE user_id = $1
    AND is_read = false
    RETURNING *
  `;

  const result = await db.query(query, [userId]);

  return result.rows;
};

const deleteNotification = async (
  notificationId,
  userId
) => {
  const query = `
    DELETE FROM notifications
    WHERE id = $1
    AND user_id = $2
    RETURNING *
  `;

  const result = await db.query(query, [
    notificationId,
    userId,
  ]);

  return result.rows[0];
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};