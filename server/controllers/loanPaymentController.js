const pool = require("../config/db");

const {
  createLoanPaymentModel,
  getLoanPaymentsModel,
  getTotalPaidModel,
} = require("../models/loanPaymentModel");

const getLoanBalance = async (loanId) => {
  const loan = await pool.query(
    `SELECT * FROM loans WHERE id = $1`,
    [loanId]
  );

  const totalPaid = await getTotalPaidModel(loanId);

  const principal = Number(loan.rows[0].amount);
  const rate = Number(loan.rows[0].interest_rate);

  const totalInterest = (principal * rate) / 100;
  const totalPayable = principal + totalInterest;

  const balance =
    totalPayable - Number(totalPaid.total_paid);

  return {
    totalPayable,
    totalPaid: totalPaid.total_paid,
    balance,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE PAYMENT
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

    const balanceData = await getLoanBalance(loan_id);

    const principalPaid =
      amount > balanceData.balance
        ? balanceData.balance
        : amount;

    const interestPaid = amount - principalPaid;

    const newBalance =
      balanceData.balance - amount;

    const payment =
      await createLoanPaymentModel(
        loan_id,
        amount,
        principalPaid,
        interestPaid,
        newBalance,
        payment_method,
        mpesa_code
      );

    res.status(201).json({
      message: "Payment recorded",
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
    const payments = await getLoanPaymentsModel(
      req.params.loanId
    );

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLoanPayment,
  getLoanPayments,
};