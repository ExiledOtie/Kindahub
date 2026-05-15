const express = require("express");

const router = express.Router();

const {
  createGroup,
} = require("../controllers/groupController");

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("super_admin"),
  createGroup
);

module.exports = router;