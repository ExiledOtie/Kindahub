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
} = require("../controllers/savingsController");

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
| Single SAVING
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