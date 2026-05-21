const pool = require("../config/db");

const prefixes = {
  "Kinda Family": "KD",
  "13 Amigos": "AM",
};

const generateUsername = async (groupName) => {

  const prefix = prefixes[groupName];

  if (!prefix) {
    throw new Error("Invalid group");
  }

  // GET LAST USERNAME
  const result = await pool.query(
    `
    SELECT username
    FROM users
    WHERE username LIKE $1
    ORDER BY id DESC
    LIMIT 1
    `,
    [`${prefix}%`]
  );

  let nextNumber = 1;

  if (result.rows.length > 0) {

    const lastUsername = result.rows[0].username;

    const lastNumber = parseInt(
      lastUsername.replace(prefix, "")
    );

    nextNumber = lastNumber + 1;
  }

  const formattedNumber = String(nextNumber).padStart(4, "0");

  return `${prefix}${formattedNumber}`;
};

module.exports = generateUsername;