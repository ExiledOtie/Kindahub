const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getSummaryReport,
  getReports,
} = require("../controllers/reportController");

/*
|--------------------------------------------------------------------------
| SUMMARY
|--------------------------------------------------------------------------
*/

router.get(
  "/summary",
  authMiddleware,
  getSummaryReport
);

/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getReports
);

module.exports = router;