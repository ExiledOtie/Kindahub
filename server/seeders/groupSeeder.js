const pool = require("../config/db");

const seedGroups = async () => {
  try {
    await pool.query(`
      INSERT INTO groups (name, description, created_by)
      VALUES 
      ('Kinda Family', 'Main group', 1),
      ('13 Amigos', 'Second group', 1)
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log("Groups seeded successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = seedGroups;