const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE LOAN
|--------------------------------------------------------------------------
*/

const createLoanModel = async (
  userId,
  groupId,
  amount,
  purpose,
  interestRate,
  durationMonths,
) => {
  const result = await pool.query(
    `
    INSERT INTO loans
    (
      user_id,
      group_id,
      amount,
      purpose,
      interest_rate,
      duration_months
    )

    VALUES ($1,$2,$3,$4,$5,$6)

    RETURNING *
    `,
    [userId, groupId, amount, purpose, interestRate, durationMonths],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET ALL LOANS
|--------------------------------------------------------------------------
*/

const getAllLoansModel = async () => {
  const result = await pool.query(
    `
    SELECT
      l.*,
      u.fullname,
      u.username,
      g.name AS group_name,

      approver.fullname AS approved_by_name

    FROM loans l

    INNER JOIN users u
      ON u.id = l.user_id

    INNER JOIN groups g
      ON g.id = l.group_id

    LEFT JOIN users approver
      ON approver.id = l.approved_by

    ORDER BY l.created_at DESC
    `,
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET USER LOANS
|--------------------------------------------------------------------------
*/

const getUserLoansModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      l.*,
      u.fullname,
      u.username,
      g.name AS group_name

    FROM loans l

    INNER JOIN users u
      ON u.id = l.user_id

    INNER JOIN groups g
      ON g.id = l.group_id

    WHERE l.user_id = $1

    ORDER BY l.created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| ACTIVE LOAN
|--------------------------------------------------------------------------
*/

const getActiveLoanModel = async (userId) => {
  const result = await pool.query(
    `
        SELECT *
        FROM loans

        WHERE user_id = $1
        AND status = 'approved'
        AND balance > 0

        ORDER BY created_at DESC
        LIMIT 1
        `,
    [userId],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET SINGLE LOAN
|--------------------------------------------------------------------------
*/

const getSingleLoanModel = async (id) => {
  const result = await pool.query(
    `
    SELECT
      l.*,
      u.fullname,
      u.username,
      g.name AS group_name

    FROM loans l

    INNER JOIN users u
      ON u.id = l.user_id

    INNER JOIN groups g
      ON g.id = l.group_id

    WHERE l.id = $1
    `,
    [id],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| APPROVE LOAN
|--------------------------------------------------------------------------
*/

const approveLoanModel = async (loanId, approvedBy, interestRate = null) => {
  const loanResult = await pool.query(
    `
    SELECT *
    FROM loans
    WHERE id=$1
    `,
    [loanId],
  );

  const loan = loanResult.rows[0];

  if (!loan) return null;

  const rate =
    interestRate !== null ? Number(interestRate) : Number(loan.interest_rate);

  const totalInterest = (Number(loan.amount) * rate) / 100;

  const totalPayable = Number(loan.amount) + totalInterest;

  const result = await pool.query(
    `
    UPDATE loans

    SET
      status='approved',
      approved_by=$2,
      approved_at=NOW(),
      interest_rate=$3,
      total_payable=$4,
      balance=$4

    WHERE id=$1

    RETURNING *
    `,
    [loanId, approvedBy, rate, totalPayable],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| REJECT LOAN
|--------------------------------------------------------------------------
*/

const rejectLoanModel = async (loanId) => {
  const result = await pool.query(
    `
    UPDATE loans

    SET
      status='rejected',
      rejected_at=NOW()

    WHERE id=$1

    RETURNING *
    `,
    [loanId],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| LOAN STATS
|--------------------------------------------------------------------------
*/

const getLoanStatsModel = async () => {
  const result = await pool.query(
    `
        SELECT

        COUNT(*) AS total_loans,

        COUNT(*) FILTER (
          WHERE status = 'pending'
        ) AS pending_loans,

        COUNT(*) FILTER (
          WHERE status = 'approved'
        ) AS approved_loans,

        COUNT(*) FILTER (
          WHERE status = 'rejected'
        ) AS rejected_loans,

        COALESCE(
          SUM(amount),
          0
        ) AS total_amount

        FROM loans
        `,
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| UPDATE INTEREST RATE
|--------------------------------------------------------------------------
*/

const updateLoanInterestModel = async (loanId, interestRate) => {
  const result = await pool.query(
    `
    UPDATE loans
    SET interest_rate = $2
    WHERE id = $1
    RETURNING *
    `,
    [loanId, interestRate],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| DELETE LOAN
|--------------------------------------------------------------------------
*/

const deleteLoanModel = async (id) => {
  await pool.query(
    `
    DELETE FROM loans
    WHERE id = $1
    `,
    [id],
  );

  return true;
};

module.exports = {
  createLoanModel,
  getAllLoansModel,
  getUserLoansModel,
  getSingleLoanModel,
  approveLoanModel,
  rejectLoanModel,
  getLoanStatsModel,
  deleteLoanModel,
  getActiveLoanModel,
  updateLoanInterestModel,
};
