const pool = require("../config/db");

const CommunicationModel = {
  // ==========================
  // Conversations
  // ==========================
async getUserConversations(userId) {
  const query = `
    SELECT
      c.id,
      c.type,
      c.group_id,

      (
        SELECT m.message
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.is_deleted = FALSE
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message,

      (
        SELECT m.created_at
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.is_deleted = FALSE
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_time,

      (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender_id <> $1
          AND m.read_at IS NULL
          AND m.is_deleted = FALSE
      ) AS unread

    FROM conversations c
    INNER JOIN conversation_participants cp
      ON cp.conversation_id = c.id

    WHERE cp.user_id = $1

    ORDER BY last_time DESC NULLS LAST;
  `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
},

async markConversationAsRead(conversationId, userId) {
  const query = `
    UPDATE messages
    SET read_at = NOW()
    WHERE conversation_id = $1
      AND sender_id <> $2
      AND read_at IS NULL
      AND is_deleted = FALSE
  `;

  await pool.query(query, [conversationId, userId]);
},

  async getConversationById(conversationId) {
    const query = `
      SELECT *
      FROM conversations
      WHERE id = $1
    `;

    const { rows } = await pool.query(query, [conversationId]);

    return rows[0];
  },

  async createConversation(type, groupId = null) {
    const query = `
      INSERT INTO conversations (type, group_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const { rows } = await pool.query(query, [type, groupId]);

    return rows[0];
  },

  // ==========================
  // Participants
  // ==========================
  async addParticipant(conversationId, userId) {
    const query = `
      INSERT INTO conversation_participants
      (conversation_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (conversation_id, user_id)
      DO NOTHING
      RETURNING *
    `;

    const { rows } = await pool.query(query, [conversationId, userId]);

    return rows[0];
  },

  async getParticipants(conversationId) {
    const query = `
      SELECT
        u.id,
        u.full_name
      FROM conversation_participants cp
      INNER JOIN users u
        ON cp.user_id = u.id
      WHERE cp.conversation_id = $1
    `;

    const { rows } = await pool.query(query, [conversationId]);

    return rows;
  },

  // ==========================
  // Messages
  // ==========================
  async getMessages(conversationId) {
    const query = `
    SELECT
      m.id,
      m.conversation_id,
      m.sender_id,
      u.fullname AS sender_name,
      m.message,
      m.created_at,
      m.read_at
    FROM messages m
    INNER JOIN users u
      ON m.sender_id = u.id
    WHERE m.conversation_id = $1
      AND m.is_deleted = FALSE
    ORDER BY m.created_at ASC
  `;

    const { rows } = await pool.query(query, [conversationId]);

    return rows;
  },

  async createMessage(conversationId, senderId, message) {
    const query = `
      INSERT INTO messages
      (conversation_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      conversationId,
      senderId,
      message,
    ]);

    return rows[0];
  },

  async findPrivateConversation(user1, user2) {
    const query = `
    SELECT c.*
    FROM conversations c
    INNER JOIN conversation_participants cp1
      ON c.id = cp1.conversation_id
    INNER JOIN conversation_participants cp2
      ON c.id = cp2.conversation_id
    WHERE c.type = 'private'
      AND cp1.user_id = $1
      AND cp2.user_id = $2
  `;

    const { rows } = await pool.query(query, [user1, user2]);

    return rows[0];
  },

  async getMyGroupMembers(userId) {
    const query = `
    SELECT
      u.id,
      u.fullname,
      u.username
    FROM user_groups ug
    INNER JOIN users u
      ON ug.user_id = u.id
    WHERE ug.group_id = (
      SELECT group_id
      FROM user_groups
      WHERE user_id = $1
      LIMIT 1
    )
    AND u.id != $1
    ORDER BY u.fullname
  `;

    const { rows } = await pool.query(query, [userId]);

    return rows;
  },

  async getMyGroup(userId) {
    const query = `
    SELECT
      g.id,
      g.name
    FROM user_groups ug
    INNER JOIN groups g
      ON ug.group_id = g.id
    WHERE ug.user_id = $1
    LIMIT 1
  `;

    const { rows } = await pool.query(query, [userId]);

    return rows[0];
  },

  async getGroupConversation(groupId) {
    const query = `
    SELECT *
    FROM conversations
    WHERE group_id = $1
      AND type = 'group'
  `;

    const { rows } = await pool.query(query, [groupId]);

    return rows[0];
  },

  async deleteMessage(messageId) {
    const query = `
      UPDATE messages
      SET is_deleted = TRUE
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [messageId]);

    return rows[0];
  },
};

module.exports = CommunicationModel;
