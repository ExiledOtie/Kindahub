const {
  createLoanPayment,
  createMyLoanPayment,
  getLoanPayments,
  getLoanBalance,
  getAllLoanPayments,
  getMyLoanPayments,
} = require("../controllers/loanPaymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = require("express").Router();

/*
|--------------------------------------------------------------------------
| MEMBER SUBMIT LOAN REPAYMENT (PENDING APPROVAL)
|--------------------------------------------------------------------------
*/

router.post("/my", authMiddleware, createMyLoanPayment);

/*
|--------------------------------------------------------------------------
| MEMBER PAYMENT HISTORY
|--------------------------------------------------------------------------
*/

router.get("/my", authMiddleware, getMyLoanPayments);

/*
|--------------------------------------------------------------------------
| ADMIN CREATE PAYMENT (AUTO APPROVED)
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, createLoanPayment);

/*
|--------------------------------------------------------------------------
| ALL PAYMENTS
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, getAllLoanPayments);

/*
|--------------------------------------------------------------------------
| SINGLE LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

router.get("/:loanId", authMiddleware, getLoanPayments);

/*
|--------------------------------------------------------------------------
| LOAN BALANCE
|--------------------------------------------------------------------------
*/

router.get("/:loanId/balance", authMiddleware, getLoanBalance);

module.exports = router;
