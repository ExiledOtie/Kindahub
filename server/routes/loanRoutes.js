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
| ADMIN LOANS
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
| LOAN STATISTICS
|--------------------------------------------------------------------------
*/

router.get("/stats", authMiddleware, getLoanStats);

/*
|--------------------------------------------------------------------------
| MEMBER LOANS
|--------------------------------------------------------------------------
*/

router.post("/my", authMiddleware, createMyLoan);

router.get("/my", authMiddleware, getMyLoans);

router.get("/my/active", authMiddleware, getMyActiveLoan);

/*
|--------------------------------------------------------------------------
| SINGLE LOAN
|--------------------------------------------------------------------------
*/

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
| DELETE LOAN
|--------------------------------------------------------------------------
*/

router.delete("/:id", authMiddleware, deleteLoan);

module.exports = router;
