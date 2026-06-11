const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createLoanPayment,
  getLoanPayments,
  getLoanBalance,
} = require("../controllers/loanPaymentController");

/*
|--------------------------------------------------------------------------
| CREATE PAYMENT
|--------------------------------------------------------------------------
*/
router.post("/", authMiddleware, createLoanPayment);

/*
|--------------------------------------------------------------------------
| GET PAYMENTS
|--------------------------------------------------------------------------
*/
router.get("/:loanId", authMiddleware, getLoanPayments);

/*
|--------------------------------------------------------------------------
| GET BALANCE
|--------------------------------------------------------------------------
*/
router.get("/:loanId/balance", authMiddleware, getLoanBalance);

module.exports = router;