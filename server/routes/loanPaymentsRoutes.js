const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createLoanPayment,
  getLoanPayments,
} = require("../controllers/loanPaymentController");

/*
|--------------------------------------------------------------------------
| CREATE PAYMENT
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, createLoanPayment);

/*
|--------------------------------------------------------------------------
| GET LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

router.get("/:loanId", authMiddleware, getLoanPayments);

module.exports = router;