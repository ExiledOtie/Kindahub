const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE LOAN PAYMENT
|--------------------------------------------------------------------------
*/

const createLoanPaymentModel = async (
  loanId,
  amount,
  principalPaid,
  interestPaid,
  balanceAfter,
  paymentMethod,
  mpesaCode
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
      payment_method,
      mpesa_code
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
    `,
    [
      loanId,
      amount,
      principalPaid,
      interestPaid,
      balanceAfter,
      paymentMethod,
      mpesaCode,
    ]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET LOAN PAYMENTS
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
| GET TOTAL PAID
|--------------------------------------------------------------------------
*/

const getTotalPaidModel = async (loanId) => {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(amount), 0) AS total_paid
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