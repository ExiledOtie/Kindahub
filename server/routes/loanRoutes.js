const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createLoan,
  getAllLoans,
  getUserLoans,
  getSingleLoan,
  approveLoan,
  rejectLoan,
  getLoanStats,
  getMyActiveLoan,
  createMyLoan,
  getMyLoans,
  deleteLoan,
  updateLoanInterest,
} = require("../controllers/loanController");

/*
|--------------------------------------------------------------------------
| CREATE LOAN
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, createLoan);

/*
|--------------------------------------------------------------------------
| GET ALL LOANS
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, getAllLoans);

/*
|--------------------------------------------------------------------------
| USER LOANS
|--------------------------------------------------------------------------
*/

router.get("/user/:userId", authMiddleware, getUserLoans);

/*
|--------------------------------------------------------------------------
| LOAN STATS
|--------------------------------------------------------------------------
*/

router.get("/stats", authMiddleware, getLoanStats);

/*
|--------------------------------------------------------------------------
| SINGLE LOAN
|--------------------------------------------------------------------------
*/
router.post("/my", authMiddleware, createMyLoan);

router.get("/my/active", authMiddleware, getMyActiveLoan);

router.get("/my", authMiddleware, getMyLoans);

router.get("/user/:userId", authMiddleware, getUserLoans);

router.get("/:id", authMiddleware, getSingleLoan);

/*
|--------------------------------------------------------------------------
| APPROVE LOAN
|--------------------------------------------------------------------------
*/

router.patch("/:id/approve", authMiddleware, approveLoan);

/*
|--------------------------------------------------------------------------
| REJECT LOAN
|--------------------------------------------------------------------------
*/

router.patch("/:id/reject", authMiddleware, rejectLoan);

/*
|--------------------------------------------------------------------------
| UPDATE INTEREST RATE
|--------------------------------------------------------------------------
*/

router.patch("/:id/interest", authMiddleware, updateLoanInterest);

/*
|--------------------------------------------------------------------------
| APPROVE LOAN WITH OPTIONAL INTEREST
|--------------------------------------------------------------------------
*/

router.patch("/:id/approve", authMiddleware, approveLoan);

/*
|--------------------------------------------------------------------------
| DELETE LOAN
|--------------------------------------------------------------------------
*/

router.delete("/:id", authMiddleware, deleteLoan);

module.exports = router;
