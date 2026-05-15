const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      is_super_admin: user.is_super_admin,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;