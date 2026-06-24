const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createSaving,
  getAllSavings,
  getUserSavings,
  getSingleSaving,
  getSavingsStats,
  deleteSaving,
  createMySaving,
  getMySavings,
  approveSaving,
  rejectSaving,
} = require("../controllers/savingsController");

/*
|--------------------------------------------------------------------------
| MY SAVINGS
|--------------------------------------------------------------------------
*/

router.post(
  "/my",
  authMiddleware,
  createMySaving
);

router.get(
  "/my",
  authMiddleware,
  getMySavings
);

/*
|--------------------------------------------------------------------------
| APPROVE / REJECT
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/approve",
  authMiddleware,
  approveSaving
);

router.put(
  "/:id/reject",
  authMiddleware,
  rejectSaving
);

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  createSaving
);

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getAllSavings
);

/*
|--------------------------------------------------------------------------
| USER SAVINGS
|--------------------------------------------------------------------------
*/

router.get(
  "/user/:userId",
  authMiddleware,
  getUserSavings
);

/*
|--------------------------------------------------------------------------
| STATS
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  authMiddleware,
  getSavingsStats
);

/*
|--------------------------------------------------------------------------
| SINGLE SAVING
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  getSingleSaving
);

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  deleteSaving
);

module.exports = router;