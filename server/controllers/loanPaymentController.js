const pool = require("../config/db");

const {
  createLoanPaymentModel,
  getLoanPaymentsModel,
  getTotalPaidModel,
} = require("../models/loanPaymentModel");

/*
|--------------------------------------------------------------------------
| GET LOAN BALANCE SERVICE
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

  const totalInterest = (principal * rate) / 100;
  const totalPayable = principal + totalInterest;

  const totalPaid = Number(totalPaidRes.total_paid);

  const balance = totalPayable - totalPaid;

  return {
    totalPayable,
    totalPaid,
    balance,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE LOAN PAYMENT
|--------------------------------------------------------------------------
*/

const createLoanPayment = async (req, res) => {
  try {
    const {
      loan_id,
      amount,
      payment_method,
      mpesa_code,
    } = req.body;

    const balanceData = await calculateLoanBalance(loan_id);

    let principalPaid = 0;
    let interestPaid = 0;

    let remaining = Number(amount);

    // First clear interest then principal (SACCO standard)
    if (balanceData.balance < 0) {
      principalPaid = remaining;
    } else {
      const interestPortion = (balanceData.totalPayable - balanceData.totalPaid);

      const interestToPay = Math.min(remaining, interestPortion);

      interestPaid = interestToPay;
      remaining -= interestToPay;

      principalPaid = remaining;
    }

    const newBalance = balanceData.balance - amount;

    const payment = await createLoanPaymentModel(
      loan_id,
      amount,
      principalPaid,
      interestPaid,
      newBalance,
      payment_method,
      mpesa_code
    );

    res.status(201).json({
      message: "Payment recorded successfully",
      payment,
      balance: newBalance,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

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
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
|--------------------------------------------------------------------------
| GET LOAN BALANCE
|--------------------------------------------------------------------------
*/

const getLoanBalance = async (req, res) => {
  try {
    const balance = await calculateLoanBalance(req.params.loanId);
    res.json(balance);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = {
  createLoanPayment,
  getLoanPayments,
  getLoanBalance,
};