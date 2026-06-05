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
  durationMonths
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
    [
      userId,
      groupId,
      amount,
      purpose,
      interestRate,
      durationMonths,
    ]
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
    `
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET USER LOANS
|--------------------------------------------------------------------------
*/

const getUserLoansModel = async (
  userId
) => {
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
    [userId]
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE LOAN
|--------------------------------------------------------------------------
*/

const getSingleLoanModel = async (
  id
) => {
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
    [id]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| APPROVE LOAN
|--------------------------------------------------------------------------
*/

const approveLoanModel = async (
  loanId,
  approvedBy
) => {
  const result = await pool.query(
    `
    UPDATE loans

    SET
      status = 'approved',
      approved_by = $2,
      approved_at = CURRENT_TIMESTAMP

    WHERE id = $1

    RETURNING *
    `,
    [loanId, approvedBy]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| REJECT LOAN
|--------------------------------------------------------------------------
*/

const rejectLoanModel = async (
  loanId
) => {
  const result = await pool.query(
    `
    UPDATE loans

    SET status = 'rejected'

    WHERE id = $1

    RETURNING *
    `,
    [loanId]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| LOAN STATS
|--------------------------------------------------------------------------
*/

const getLoanStatsModel =
  async () => {
    const result =
      await pool.query(
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
        `
      );

    return result.rows[0];
  };

/*
|--------------------------------------------------------------------------
| DELETE LOAN
|--------------------------------------------------------------------------
*/

const deleteLoanModel = async (
  id
) => {
  await pool.query(
    `
    DELETE FROM loans
    WHERE id = $1
    `,
    [id]
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
};