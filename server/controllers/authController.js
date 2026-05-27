const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const {
  findUserByEmailModel,
  findUserByUsernameModel,
} = require("../models/userModel");

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    let user;

    // Login with email
    if (identifier.includes("@")) {
      user = await findUserByEmailModel(identifier);
    }
    // Login with username
    else {
      user = await findUserByUsernameModel(identifier);
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

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
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  login,
};