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
| MEMBER SUBMIT LOAN REPAYMENT
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
| ADMIN CREATE PAYMENT
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
| LOAN BALANCE
|--------------------------------------------------------------------------
| IMPORTANT: Must come BEFORE /:loanId
|--------------------------------------------------------------------------
*/

router.get("/:loanId/balance", authMiddleware, getLoanBalance);

/*
|--------------------------------------------------------------------------
| SINGLE LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

router.get("/:loanId", authMiddleware, getLoanPayments);

module.exports = router;
