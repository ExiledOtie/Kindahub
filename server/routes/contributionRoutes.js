const express =
  require("express");

const router =
  express.Router();

const {
  createContribution,
  getUserContributions,
  getAllContributions,
  getContributionStats,
  deleteContribution,
} = require(
  "../controllers/contributionController"
);

const authMiddleware =
  require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  createContribution
);

/*
|--------------------------------------------------------------------------
| USER CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

router.get(
  "/user/:userId",
  authMiddleware,
  getUserContributions
);

/*
|--------------------------------------------------------------------------
| ALL CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getAllContributions
);

/*
|--------------------------------------------------------------------------
| DASHBOARD STATS
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  authMiddleware,
  getContributionStats
);

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  deleteContribution
);

module.exports = router;