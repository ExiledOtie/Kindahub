const express = require("express");

const router = express.Router();

const {
  createUser,
  getAllUsers,
  getUserStats,
  getSingleUser,
  getMemberSummary,
  getMyProfile,
  getMemberProfile,
  updateUser,
  updateMyProfile,
  resetPassword,
  deleteUser,
} = require("../controllers/userController");

const authMiddleware =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| PROFILE ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/profile/me",
  authMiddleware,
  getMyProfile
);

router.put(
  "/profile/me",
  authMiddleware,
  updateMyProfile
);

router.get(
  "/stats/count",
  authMiddleware,
  getUserStats
);

/*
|--------------------------------------------------------------------------
| MEMBER ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/member-summary/:id",
  authMiddleware,
  getMemberSummary
);

router.get(
  "/member-profile/:id",
  authMiddleware,
  getMemberProfile
);

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
| RESET PASSWORD USER
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/reset-password",
  authMiddleware,
  authorizeRoles("super_admin"),
  resetPassword
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