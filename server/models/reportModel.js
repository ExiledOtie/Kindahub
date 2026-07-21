const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| SUMMARY REPORT
|--------------------------------------------------------------------------
*/

const getSummaryReportModel = async () => {
  const result = await pool.query(`
    SELECT
      (
        SELECT COALESCE(SUM(amount), 0)
        FROM contributions
      ) AS total_contributions,

      (
        SELECT COALESCE(SUM(amount), 0)
        FROM loans
        WHERE status = 'approved'
      ) AS total_loans_issued,

      (
        SELECT COALESCE(SUM(amount), 0)
        FROM loan_payments
      ) AS total_loan_repayments,

      (
  SELECT COALESCE(SUM(interest_paid),0)
  FROM loan_payments
) AS total_interest,

      (
        SELECT COALESCE(SUM(amount), 0)
        FROM savings
      ) AS total_savings,
       (
  SELECT COALESCE(SUM(lp.interest_paid),0)
  FROM loan_payments lp
  JOIN loans l
    ON l.id = lp.loan_id
  JOIN groups g
    ON g.id = l.group_id
  WHERE LOWER(g.name)='kinda family'
) AS kinda_family_interest,

(
  SELECT COALESCE(SUM(lp.interest_paid),0)
  FROM loan_payments lp
  JOIN loans l
    ON l.id = lp.loan_id
  JOIN groups g
    ON g.id = l.group_id
  WHERE LOWER(g.name)='13 amigos'
) AS amigos_interest,

(
  SELECT COALESCE(SUM(lp.interest_paid),0)
  FROM loan_payments lp
  WHERE DATE_TRUNC('month',lp.created_at)=DATE_TRUNC('month',CURRENT_DATE)
) AS monthly_interest,

      (
        SELECT COALESCE(
          SUM(balance_after), 0
        )
        FROM (
          SELECT DISTINCT ON (loan_id)
            balance_after
          FROM loan_payments
          ORDER BY loan_id, created_at DESC
        ) balances
      ) AS outstanding_balances
  `);

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| CONTRIBUTIONS REPORT
|--------------------------------------------------------------------------
*/

const getContributionsReportModel = async () => {
  const result = await pool.query(`
    SELECT
      c.id,
      u.fullname,
      g.name AS group_name,
      c.amount,
      c.payment_method,
      c.status,
      c.created_at
    FROM contributions c
    JOIN users u
      ON u.id = c.user_id
    LEFT JOIN groups g
      ON g.id = c.group_id
    ORDER BY c.created_at DESC
  `);

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| LOANS REPORT
|--------------------------------------------------------------------------
*/

const getLoansReportModel = async () => {
  const result = await pool.query(`
    SELECT
      l.id,
      u.fullname,
      g.name AS group_name,
      l.amount,
      l.interest_rate,
      l.duration_months,
      l.status,
      l.created_at
    FROM loans l
    JOIN users u
      ON u.id = l.user_id
    LEFT JOIN groups g
      ON g.id = l.group_id
    ORDER BY l.created_at DESC
  `);

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| REPAYMENTS REPORT
|--------------------------------------------------------------------------
*/

const getRepaymentsReportModel = async () => {
  const result = await pool.query(`
    SELECT
      lp.id,
      u.fullname,
      g.name AS group_name,
      lp.amount,
      lp.principal_paid,
      lp.interest_paid,
      lp.balance_after,
      lp.payment_method,
      lp.created_at
    FROM loan_payments lp
    JOIN loans l
      ON l.id = lp.loan_id
    JOIN users u
      ON u.id = l.user_id
    LEFT JOIN groups g
      ON g.id = l.group_id
    ORDER BY lp.created_at DESC
  `);

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| SAVINGS REPORT
|--------------------------------------------------------------------------
*/

const getSavingsReportModel = async () => {
  const result = await pool.query(`
    SELECT
      s.id,
      u.fullname,
      g.name AS group_name,
      s.amount,
      s.payment_method,
      s.status,
      s.created_at
    FROM savings s
    JOIN users u
      ON u.id = s.user_id
    LEFT JOIN groups g
      ON g.id = s.group_id
    ORDER BY s.created_at DESC
  `);

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| INTEREST REPORT
|--------------------------------------------------------------------------
*/

const getInterestReportModel = async () => {
  const result = await pool.query(`
    SELECT
      lp.created_at AS date,
      u.fullname AS member,
      g.name AS group_name,

      CONCAT('LN-', l.id) AS loan_reference,

      lp.interest_paid AS interest_collected,

      l.status

    FROM loan_payments lp

    INNER JOIN loans l
      ON l.id = lp.loan_id

    INNER JOIN users u
      ON u.id = l.user_id

    LEFT JOIN groups g
      ON g.id = l.group_id

    WHERE lp.interest_paid > 0

    ORDER BY lp.created_at DESC;
  `);

  return result.rows;
};

module.exports = {
  getSummaryReportModel,
  getContributionsReportModel,
  getLoansReportModel,
  getRepaymentsReportModel,
  getSavingsReportModel,
  getInterestReportModel,
};
