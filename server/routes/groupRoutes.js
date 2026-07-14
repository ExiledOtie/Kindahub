const express = require("express");

const router = express.Router();

const {
  createGroup,
  getGroups,
} = require("../controllers/groupController");
const {
  getMyGroups,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| GET GROUPS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getGroups,
  getMyGroups
);

/*
|--------------------------------------------------------------------------
| CREATE GROUP
|--------------------------------------------------------------------------
*/

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("super_admin"),
  createGroup
);

module.exports = router;