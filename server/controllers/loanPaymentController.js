const pool = require("../config/db");

const {
  createLoanPaymentModel,
  getLoanPaymentsModel,
  getTotalPaidModel,
  getAllLoanPaymentsModel,
} = require("../models/loanPaymentModel");

/*
|--------------------------------------------------------------------------
| CONFIG (can later move to DB settings table)
|--------------------------------------------------------------------------
*/
const PENALTY_RATE = 5; // 5% monthly penalty for overdue

/*
|--------------------------------------------------------------------------
| LOAN BALANCE CALCULATOR
|--------------------------------------------------------------------------
*/

const calculateLoanBalance = async (loanId) => {
  const loanRes = await pool.query(
    `SELECT * FROM loans WHERE id = $1`,
    [loanId]
  );

  if (!loanRes.rows[0]) {
    throw new Error("Loan not found");
  }

  const loan = loanRes.rows[0];

  const totalPaidRes = await getTotalPaidModel(loanId);

  const principal = Number(loan.amount);
  const rate = Number(loan.interest_rate);
  const duration = Number(loan.duration_months);

  const totalInterest = (principal * rate) / 100;
  let totalPayable = principal + totalInterest;

  const totalPaid = Number(totalPaidRes.total_paid);

  /*
  |--------------------------------------------------------------------------
  | 🧠 OVERDUE PENALTY ENGINE
  |--------------------------------------------------------------------------
  */

  const startDate = new Date(loan.created_at);
  const now = new Date();

  const monthsPassed =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  const expectedMonthlyPayment =
    totalPayable / duration;

  const expectedPaidTillNow =
    expectedMonthlyPayment * monthsPassed;

  let overdue = expectedPaidTillNow - totalPaid;

  let penalty = 0;

  if (overdue > 0) {
    penalty = (overdue * PENALTY_RATE) / 100;
  }

  totalPayable += penalty;

  const balance = totalPayable - totalPaid;

  return {
    totalPayable,
    totalPaid,
    balance,
    expectedMonthlyPayment,
    overdue,
    penalty,
    monthsPassed,
  };
};


/*
|--------------------------------------------------------------------------
| GET ALL LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

const getAllLoanPayments = async (req, res) => {
  try {
    const payments = await getAllLoanPaymentsModel();

    res.status(200).json(payments);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


/*
|--------------------------------------------------------------------------
| CREATE LOAN PAYMENT
|--------------------------------------------------------------------------
*/

const createLoanPayment = async (req, res) => {
  try {
    const { loan_id, amount, payment_method, mpesa_code } = req.body;

    const balanceData = await calculateLoanBalance(loan_id);

    const paymentAmount = Number(amount || 0);

    let remaining = paymentAmount;

    // 💡 SAFE VALUES
    const currentBalance = Number(balanceData.balance || 0);

    if (paymentAmount <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    // -----------------------------
    // INTEREST FIRST STRATEGY
    // -----------------------------
    const interestPortion = Math.max(currentBalance, 0);

    const interestPaid = Math.min(remaining, interestPortion);
    remaining -= interestPaid;

    const principalPaid = remaining;

    // -----------------------------
    // NEW BALANCE (SAFE)
    // -----------------------------
    const newBalance = Math.max(currentBalance - paymentAmount, 0);

    const payment = await createLoanPaymentModel(
      loan_id,
      paymentAmount,
      principalPaid,
      interestPaid,
      newBalance,
      payment_method,
      mpesa_code || null
    );

    return res.status(201).json({
      message: "Payment recorded successfully",
      payment,
      balance: newBalance,
    });

  } catch (error) {
    console.log("LOAN PAYMENT ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

const getLoanPayments = async (req, res) => {
  try {
    const payments = await getLoanPaymentsModel(
      req.params.loanId
    );

    res.status(200).json(payments);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET LOAN BALANCE + METRICS
|--------------------------------------------------------------------------
*/

const getLoanBalance = async (req, res) => {
  try {
    const balance = await calculateLoanBalance(
      req.params.loanId
    );

    res.json(balance);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  createLoanPayment,
  getLoanPayments,
  getLoanBalance,
  getAllLoanPayments,
};