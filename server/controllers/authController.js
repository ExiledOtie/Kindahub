const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const generateToken = require("../utils/generateToken");

const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // CHECK USER
    const userResult = await pool.query(
      `
      SELECT * FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // TOKEN
    const token = generateToken(user);

    res.status(200).json({
      token,

      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        is_super_admin: user.is_super_admin,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  login,
};