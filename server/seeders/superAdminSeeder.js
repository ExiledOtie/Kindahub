const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const seedSuperAdmin = async () => {
  try {

    const existingAdmin = await pool.query(
      `
      SELECT * FROM users
      WHERE is_super_admin = true
      `
    );

    if (existingAdmin.rows.length > 0) {
      console.log("Super admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      "admin@123",
      10
    );

    await pool.query(
      `
      INSERT INTO users
      (
        fullname,
        email,
        password,
        role,
        is_super_admin
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        "Super Admin",
        "meshack@kindafamilygroup.com",
        hashedPassword,
        "super_admin",
        true,
      ]
    );

    console.log("Super admin created");

  } catch (error) {
    console.log(error);
  }
};

module.exports = seedSuperAdmin;