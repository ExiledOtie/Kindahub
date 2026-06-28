const pool = require("../config/db");

const {
  createLoanPaymentModel,
  getLoanPaymentsModel,
  getTotalPaidModel,
  getAllLoanPaymentsModel,
  getPaymentBreakdownModel,
  getMyLoanPaymentsModel,
  updateLoanBalanceModel,
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
  const loanRes = await pool.query(`SELECT * FROM loans WHERE id = $1`, [
    loanId,
  ]);

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

  const expectedMonthlyPayment = totalPayable / duration;

  const expectedPaidTillNow = expectedMonthlyPayment * monthsPassed;

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

const createLoanPayment = async (req, res) => {
  try {
    const { loan_id, amount, payment_method, mpesa_code } = req.body;

    const paymentAmount = Number(amount || 0);

    if (paymentAmount <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    const loanRes = await pool.query(
      `
      SELECT *
      FROM loans
      WHERE id = $1
      `,
      [loan_id],
    );

    if (loanRes.rows.length === 0) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    const loan = loanRes.rows[0];

    const principal = Number(loan.amount);

    const totalInterest = (principal * Number(loan.interest_rate)) / 100;

    const breakdown = await getPaymentBreakdownModel(loan_id);

    const principalAlreadyPaid = Number(breakdown.principal_paid);

    const interestAlreadyPaid = Number(breakdown.interest_paid);

    const remainingPrincipal = Math.max(principal - principalAlreadyPaid, 0);

    const remainingInterest = Math.max(totalInterest - interestAlreadyPaid, 0);

    let remaining = paymentAmount;

    const interestPaid = Math.min(remaining, remainingInterest);

    remaining -= interestPaid;

    const principalPaid = Math.min(remaining, remainingPrincipal);

    remaining -= principalPaid;

    const currentBalance = Number(loan.balance);

    const newBalance = Math.max(currentBalance - paymentAmount, 0);

    /*
|--------------------------------------------------------------------------
| SAVE PAYMENT
|--------------------------------------------------------------------------
*/

const payment = await createLoanPaymentModel(
  loan_id,
  paymentAmount,
  principalPaid,
  interestPaid,
  newBalance,
  payment_method,
  mpesa_code || null
);

/*
|--------------------------------------------------------------------------
| RECALCULATE LOAN
|--------------------------------------------------------------------------
*/

const updatedBalance = await calculateLoanBalance(loan_id);

/*
|--------------------------------------------------------------------------
| UPDATE LOAN TABLE
|--------------------------------------------------------------------------
*/

const updatedLoan = await updateLoanBalanceModel(
  loan_id,
  updatedBalance.totalPayable,
  updatedBalance.balance
);

/*
|--------------------------------------------------------------------------
| MARK LOAN AS REPAID
|--------------------------------------------------------------------------
*/

if (updatedLoan.balance <= 0) {
  await pool.query(
    `
    UPDATE loans
    SET
      status = 'repaid',
      balance = 0
    WHERE id = $1
    `,
    [loan_id]
  );

  updatedLoan.status = "repaid";
  updatedLoan.balance = 0;
}

/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

return res.status(201).json({
  message: "Payment recorded successfully",
  payment,
  loan: updatedLoan,
  balance: updatedLoan.balance,
});
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

const getLoanPayments = async (req, res) => {
  try {
    const payments = await getLoanPaymentsModel(req.params.loanId);

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyLoanPayments = async (req, res) => {
  try {
    const payments = await getMyLoanPaymentsModel(req.user.id);

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
| GET LOAN BALANCE + METRICS
|--------------------------------------------------------------------------
*/

const getLoanBalance = async (req, res) => {
  try {
    const balance = await calculateLoanBalance(req.params.loanId);

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
  getMyLoanPayments,
};
