const express =
  require("express");

const router =
  express.Router();

const {
  createContribution,
  createMyContribution,
  getMyContributions,
  getUserContributions,
  getAllContributions,
  getContributionStats,
  deleteContribution,
} = require("../controllers/contributionController");

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
| MEMBER CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  authMiddleware,
  getMyContributions
);

router.post(
  "/my",
  authMiddleware,
  createMyContribution
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