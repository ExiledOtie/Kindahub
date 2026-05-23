const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createContribution,
  getMemberContributions,
  deleteContribution,
} = require("../controllers/contributionController");

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
| GET MEMBER CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

router.get(
  "/member/:memberId",
  authMiddleware,
  getMemberContributions
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