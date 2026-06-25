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

/*
|--------------------------------------------------------------------------
| GET ALL LOAN PAYMENTS
|--------------------------------------------------------------------------
*/

const getAllLoanPaymentsModel = async () => {
  const result = await pool.query(`
    SELECT
      lp.id,
      lp.loan_id,
      lp.amount,
      lp.payment_method,
      lp.principal_paid,
      lp.interest_paid,
      lp.balance_after,
      lp.created_at,
      l.id AS loan_number,
      u.fullname,
      g.name AS group_name
    FROM loan_payments lp
    JOIN loans l
      ON lp.loan_id = l.id
    JOIN users u
      ON l.user_id = u.id
    LEFT JOIN groups g
      ON l.group_id = g.id
    ORDER BY lp.created_at DESC
  `);

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET PRINCIPAL & INTEREST PAID
|--------------------------------------------------------------------------
*/

const getPaymentBreakdownModel = async (loanId) => {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(principal_paid),0) AS principal_paid,

      COALESCE(SUM(interest_paid),0) AS interest_paid

    FROM loan_payments

    WHERE loan_id = $1
    `,
    [loanId]
  );

  return result.rows[0];
};
const getMyLoanPaymentsModel = async (
  userId
) => {
  const result = await pool.query(
    `
    SELECT
      lp.*,
      l.id AS loan_number

    FROM loan_payments lp

    INNER JOIN loans l
      ON l.id = lp.loan_id

    WHERE l.user_id = $1

    ORDER BY lp.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

module.exports = {
  createLoanPaymentModel,
  getLoanPaymentsModel,
  getTotalPaidModel,
  getAllLoanPaymentsModel,
  getPaymentBreakdownModel,
  getMyLoanPaymentsModel,
};