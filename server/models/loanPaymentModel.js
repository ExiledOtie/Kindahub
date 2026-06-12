const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE LOAN PAYMENT MODEL
|--------------------------------------------------------------------------
*/

const createLoanPaymentModel = async (
  loanId,
  amount,
  principalPaid,
  interestPaid,
  balanceAfter,
  paymentMethod
) => {
  const result = await pool.query(
    `
    INSERT INTO loan_payments
    (
      loan_id,
      amount,
      principal_paid,
      interest_paid,
      balance_after,
      payment_method
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
    [
      loanId,
      amount,
      principalPaid,
      interestPaid,
      balanceAfter,
      paymentMethod,
    ]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET LOAN PAYMENTS MODEL
|--------------------------------------------------------------------------
*/

const getLoanPaymentsModel = async (loanId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM loan_payments
    WHERE loan_id = $1
    ORDER BY created_at DESC
    `,
    [loanId]
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET TOTAL PAID MODEL
|--------------------------------------------------------------------------
*/

const getTotalPaidModel = async (loanId) => {
  const result = await pool.query(
    `
    SELECT COALESCE(SUM(amount),0) AS total_paid
    FROM loan_payments
    WHERE loan_id = $1
    `,
    [loanId]
  );

  return result.rows[0];
};

module.exports = {
  createLoanPaymentModel,
  getLoanPaymentsModel,
  getTotalPaidModel,
};