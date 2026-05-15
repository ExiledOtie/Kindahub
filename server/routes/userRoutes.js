// routes/userRoutes.js

const express = require("express");

const router = express.Router();

const {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const authMiddleware =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("super_admin"),
  createUser
);

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getAllUsers
);

/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  getSingleUser
);

/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  updateUser
);

/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  deleteUser
);

module.exports = router;