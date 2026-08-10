
const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE WALLET ALLOCATION
|--------------------------------------------------------------------------
|
| allocationType:
|   contribution
|   saving
|   loan_payment
|
| referenceId:
|   ID of the actual contribution, saving or loan payment.
|
| allocatedBy:
|   User/admin who performed the allocation.
|
| allocationMode:
|   manual
|   automatic
|
|--------------------------------------------------------------------------
*/

const createWalletAllocationModel = async (
  walletDepositId,
  allocationType,
  amount,
  allocatedBy,
  referenceId = null,
  allocationMode = "manual"
) => {
  const result = await pool.query(
    `
    INSERT INTO wallet_allocations
    (
      wallet_deposit_id,
      allocation_type,
      reference_id,
      amount,
      allocated_by,
      allocation_mode,
      allocated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *
    `,
    [
      walletDepositId,
      allocationType,
      referenceId,
      amount,
      allocatedBy,
      allocationMode,
    ]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET ALLOCATIONS FOR A DEPOSIT
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
      wd.status AS deposit_status,

      u.fullname AS allocated_by_name,
      u.username AS allocated_by_username

    FROM wallet_allocations wa

    INNER JOIN wallet_deposits wd
      ON wd.id = wa.wallet_deposit_id

    LEFT JOIN users u
      ON u.id = wa.allocated_by

    WHERE wa.wallet_deposit_id = $1

    ORDER BY wa.allocated_at ASC
    `,
    [walletDepositId]
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

      u.fullname AS allocated_by_name,
      u.username AS allocated_by_username

    FROM wallet_allocations wa

    INNER JOIN wallet_deposits wd
      ON wd.id = wa.wallet_deposit_id

    LEFT JOIN users u
      ON u.id = wa.allocated_by

    WHERE wa.id = $1
    `,
    [allocationId]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET USER WALLET ALLOCATIONS
|--------------------------------------------------------------------------
*/

const getUserWalletAllocationsModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      wa.*,

      wd.amount AS deposit_amount,
      wd.remaining_balance,
      wd.payment_method,
      wd.mpesa_code,
      wd.bank_reference,
      wd.created_at AS deposit_date

    FROM wallet_allocations wa

    INNER JOIN wallet_deposits wd
      ON wd.id = wa.wallet_deposit_id

    WHERE wd.user_id = $1

    ORDER BY wa.allocated_at DESC
    `,
    [userId]
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET ALLOCATION TOTALS
|--------------------------------------------------------------------------
*/

const getWalletAllocationTotalsModel = async (walletDepositId) => {
  const result = await pool.query(
    `
    SELECT

      COALESCE(
        SUM(amount) FILTER (
          WHERE allocation_type = 'contribution'
        ),
        0
      ) AS total_contributions,

      COALESCE(
        SUM(amount) FILTER (
          WHERE allocation_type = 'saving'
        ),
        0
      ) AS total_savings,

      COALESCE(
        SUM(amount) FILTER (
          WHERE allocation_type = 'loan_payment'
        ),
        0
      ) AS total_loan_payments,

      COALESCE(
        SUM(amount),
        0
      ) AS total_allocated

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
|
| IMPORTANT:
| Normally we should NOT delete an allocation once it has already
| created a contribution, saving or loan payment.
|
| Keep this for controlled/admin operations only.
|
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

module.exports = {
  createWalletAllocationModel,
  getAllocationsByDepositModel,
  getWalletAllocationByIdModel,
  getUserWalletAllocationsModel,
  getWalletAllocationTotalsModel,
  deleteWalletAllocationModel,
};

