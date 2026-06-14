const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const pool = require("../config/db");

const {
  findUserByEmailModel,
  findUserByUsernameModel,
} = require("../models/userModel");

const login = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { identifier, password } = req.body;

    let user;

    // Login with email
    if (identifier.includes("@")) {
      console.log("EMAIL LOGIN");
      user = await findUserByEmailModel(identifier);
    }
    // Login with username
    else {
      console.log("USERNAME LOGIN");
      user = await findUserByUsernameModel(identifier);
    }

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /*
|--------------------------------------------------------------------------
| UPDATE LAST LOGIN
|--------------------------------------------------------------------------
*/

    await pool.query(
      `
  UPDATE users
  SET last_login = CURRENT_TIMESTAMP
  WHERE id = $1
  `,
      [user.id],
    );

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        is_super_admin: user.is_super_admin,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  login,
};
