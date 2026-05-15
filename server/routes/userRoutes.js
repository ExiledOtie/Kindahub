const express = require("express");

const router = express.Router();

const {
  createUser,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("super_admin"),
  createUser
);

module.exports = router;