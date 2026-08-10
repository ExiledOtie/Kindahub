
const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE WALLET ALLOCATION
|--------------------------------------------------------------------------
*/

const createWalletAllocationModel = async (
  walletDepositId,
  type,
  amount,
  loanId = null,
  allocationMode = "manual"
) => {
  const result = await pool.query(
    `
    INSERT INTO wallet_allocations
    (
      wallet_deposit_id,
      type,
      amount,
      loan_id,
      allocation_mode
    )

    VALUES ($1, $2, $3, $4, $5)

    RETURNING *
    `,
    [
      walletDepositId,
      type,
      amount,
      loanId,
      allocationMode,
    ]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| GET ALLOCATIONS BY DEPOSIT
|--------------------------------------------------------------------------
*/

const getAllocationsByDepositModel = async (walletDepositId) => {
  const result = await pool.query(
    `
    SELECT
      wa.*,

      wd.user_id,
      wd.amount AS deposit_amount,
      wd.remaining_balance,
      wd.payment_method,
      wd.mpesa_code,
      wd.bank_reference,

      u.fullname,
      u.username

    FROM wallet_allocations wa

    INNER JOIN wallet_deposits wd
      ON wd.id = wa.wallet_deposit_id

    INNER JOIN users u
      ON u.id = wd.user_id

    WHERE wa.wallet_deposit_id = $1

    ORDER BY wa.created_at DESC
    `,
    [walletDepositId]
  );

  return result.rows;
};


/*
|--------------------------------------------------------------------------
| GET ALLOCATIONS BY USER
|--------------------------------------------------------------------------
*/

const getUserWalletAllocationsModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      wa.*,

      wd.amount AS deposit_amount,
      wd.payment_method,
      wd.mpesa_code,
      wd.bank_reference,

      l.id AS loan_id,
      l.amount AS loan_amount,

      u.fullname,
      u.username

    FROM wallet_allocations wa

    INNER JOIN wallet_deposits wd
      ON wd.id = wa.wallet_deposit_id

    INNER JOIN users u
      ON u.id = wd.user_id

    LEFT JOIN loans l
      ON l.id = wa.loan_id

    WHERE wd.user_id = $1

    ORDER BY wa.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};


/*
|--------------------------------------------------------------------------
| GET SINGLE ALLOCATION
|--------------------------------------------------------------------------
*/

const getWalletAllocationByIdModel = async (allocationId) => {
  const result = await pool.query(
    `
    SELECT
      wa.*,

      wd.user_id,
      wd.amount AS deposit_amount,
      wd.remaining_balance,
      wd.payment_method,
      wd.mpesa_code,
      wd.bank_reference,

      u.fullname,
      u.username

    FROM wallet_allocations wa

    INNER JOIN wallet_deposits wd
      ON wd.id = wa.wallet_deposit_id

    INNER JOIN users u
      ON u.id = wd.user_id

    WHERE wa.id = $1
    `,
    [allocationId]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| GET TOTAL ALLOCATED AMOUNT
|--------------------------------------------------------------------------
*/

const getTotalAllocatedModel = async (walletDepositId) => {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(amount), 0) AS total_allocated

    FROM wallet_allocations

    WHERE wallet_deposit_id = $1
    `,
    [walletDepositId]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| GET ALLOCATED AMOUNT BY TYPE
|--------------------------------------------------------------------------
*/

const getAllocatedAmountByTypeModel = async (
  walletDepositId,
  type
) => {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(amount), 0) AS total_allocated

    FROM wallet_allocations

    WHERE wallet_deposit_id = $1
      AND type = $2
    `,
    [walletDepositId, type]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| GET REMAINING UNALLOCATED AMOUNT
|--------------------------------------------------------------------------
|
| Example:
|
| Deposit = 10,000
| Contribution = 2,000
| Savings = 3,000
| Loan = 4,000
|
| Remaining = 1,000
|
*/

const getRemainingAllocationModel = async (walletDepositId) => {
  const result = await pool.query(
    `
    SELECT
      wd.amount
      -
      COALESCE(
        SUM(wa.amount),
        0
      ) AS remaining_amount

    FROM wallet_deposits wd

    LEFT JOIN wallet_allocations wa
      ON wa.wallet_deposit_id = wd.id

    WHERE wd.id = $1

    GROUP BY wd.id, wd.amount
    `,
    [walletDepositId]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| GET ALLOCATION SUMMARY
|--------------------------------------------------------------------------
|
| Returns:
|
| contribution total
| savings total
| loan repayment total
| total allocated
| remaining
|
*/

const getAllocationSummaryModel = async (walletDepositId) => {
  const result = await pool.query(
    `
    SELECT

      COALESCE(
        SUM(amount) FILTER (
          WHERE type = 'contribution'
        ),
        0
      ) AS contribution_amount,

      COALESCE(
        SUM(amount) FILTER (
          WHERE type = 'savings'
        ),
        0
      ) AS savings_amount,

      COALESCE(
        SUM(amount) FILTER (
          WHERE type = 'loan'
        ),
        0
      ) AS loan_amount,

      COALESCE(
        SUM(amount),
        0
      ) AS total_allocated,

      (
        SELECT amount
        FROM wallet_deposits
        WHERE id = $1
      )
      -
      COALESCE(
        SUM(amount),
        0
      ) AS remaining_amount

    FROM wallet_allocations

    WHERE wallet_deposit_id = $1
    `,
    [walletDepositId]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| DELETE ALLOCATION
|--------------------------------------------------------------------------
*/

const deleteWalletAllocationModel = async (allocationId) => {
  const result = await pool.query(
    `
    DELETE FROM wallet_allocations

    WHERE id = $1

    RETURNING *
    `,
    [allocationId]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
  createWalletAllocationModel,
  getAllocationsByDepositModel,
  getUserWalletAllocationsModel,
  getWalletAllocationByIdModel,
  getTotalAllocatedModel,
  getAllocatedAmountByTypeModel,
  getRemainingAllocationModel,
  getAllocationSummaryModel,
  deleteWalletAllocationModel,
};

