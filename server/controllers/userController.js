const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const createUser = async (req, res) => {
  try {

    const {
      fullname,
      email,
      phone,
      password,
      role,
    } = req.body;

    // CHECK EMAIL
    const existingUser = await pool.query(
      `
      SELECT * FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const result = await pool.query(
      `
      INSERT INTO users
      (
        fullname,
        email,
        phone,
        password,
        role
      )

      VALUES ($1, $2, $3, $4, $5)

      RETURNING *
      `,
      [
        fullname,
        email,
        phone,
        hashedPassword,
        role,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createUser,
};