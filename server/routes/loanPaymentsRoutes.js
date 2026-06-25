const {
  createLoanPayment,
  getLoanPayments,
  getLoanBalance,
  getAllLoanPayments,
  getMyLoanPayments,
} = require("../controllers/loanPaymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", authMiddleware, createLoanPayment);

router.get("/", authMiddleware, getAllLoanPayments);

router.get("/my", authMiddleware, getMyLoanPayments);

router.get("/:loanId", authMiddleware, getLoanPayments);

router.get("/:loanId/balance", authMiddleware, getLoanBalance);

module.exports = router;
