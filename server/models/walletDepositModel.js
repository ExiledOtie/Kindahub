
const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE WALLET DEPOSIT
|--------------------------------------------------------------------------
*/

const createWalletDepositModel = async (
  userId,
  amount,
  paymentMethod,
  mpesaCode,
  bankReference,
  depositSource = "member"
) => {
  const result = await pool.query(
    `
    INSERT INTO wallet_deposits
    (
      user_id,
      amount,
      remaining_balance,
      payment_method,
      mpesa_code,
      bank_reference,
      deposit_source
    )
    VALUES ($1, $2, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      userId,
      amount,
      paymentMethod,
      mpesaCode,
      bankReference,
      depositSource,
    ]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET ALL WALLET DEPOSITS
|--------------------------------------------------------------------------
*/

const getAllWalletDepositsModel = async () => {
  const result = await pool.query(
    `
    SELECT
      wd.*,
      u.fullname,
      u.username,
      verifier.fullname AS verified_by_name

    FROM wallet_deposits wd

    INNER JOIN users u
      ON u.id = wd.user_id

    LEFT JOIN users verifier
      ON verifier.id = wd.verified_by

    ORDER BY wd.created_at DESC
    `
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET MEMBER WALLET DEPOSITS
|--------------------------------------------------------------------------
*/

const getMyWalletDepositsModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM wallet_deposits
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE WALLET DEPOSIT
|--------------------------------------------------------------------------
*/

const getWalletDepositModel = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM wallet_deposits
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET WALLET DEPOSIT DETAILS
|--------------------------------------------------------------------------
*/

const getWalletDepositDetailsModel = async (depositId) => {
  const result = await pool.query(
    `
    SELECT
      wd.*,
      ug.group_id

    FROM wallet_deposits wd

    LEFT JOIN user_groups ug
      ON ug.user_id = wd.user_id

    WHERE wd.id = $1

    LIMIT 1
    `,
    [depositId]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| VERIFY WALLET DEPOSIT
|--------------------------------------------------------------------------
*/

const verifyWalletDepositModel = async (
  id,
  verifiedBy
) => {
  const result = await pool.query(
    `
    UPDATE wallet_deposits

    SET
      status = 'verified',
      verified_by = $2,
      verified_at = NOW()

    WHERE id = $1

    RETURNING *
    `,
    [id, verifiedBy]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| REJECT WALLET DEPOSIT
|--------------------------------------------------------------------------
*/

const rejectWalletDepositModel = async (
  id,
  notes = null
) => {
  const result = await pool.query(
    `
    UPDATE wallet_deposits

    SET
      status = 'rejected',
      notes = $2

    WHERE id = $1

    RETURNING *
    `,
    [id, notes]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| UPDATE REMAINING WALLET BALANCE
|--------------------------------------------------------------------------
|
| This is used when money is allocated from the wallet.
|
| Example:
|
| Deposit = 10,000
| Allocate = 6,000
| Remaining = 4,000
|
|--------------------------------------------------------------------------
*/

const updateRemainingBalanceModel = async (
  id,
  remainingBalance
) => {
  const result = await pool.query(
    `
    UPDATE wallet_deposits

    SET
      remaining_balance = $2

    WHERE id = $1

    RETURNING *
    `,
    [id, remainingBalance]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| CHECK DUPLICATE PAYMENT REFERENCE
|--------------------------------------------------------------------------
*/

const checkDuplicateWalletReferenceModel = async (
  paymentMethod,
  mpesaCode,
  bankReference
) => {
  let result;

  if (
    paymentMethod === "mpesa" &&
    mpesaCode
  ) {
    result = await pool.query(
      `
      SELECT id
      FROM wallet_deposits
      WHERE mpesa_code = $1
      `,
      [mpesaCode]
    );
  } else if (
    paymentMethod === "bank" &&
    bankReference
  ) {
    result = await pool.query(
      `
      SELECT id
      FROM wallet_deposits
      WHERE bank_reference = $1
      `,
      [bankReference]
    );
  } else {
    return false;
  }

  return result.rows.length > 0;
};

module.exports = {
  createWalletDepositModel,
  getAllWalletDepositsModel,
  getMyWalletDepositsModel,
  getWalletDepositDetailsModel,
  getWalletDepositModel,
  verifyWalletDepositModel,
  rejectWalletDepositModel,
  updateRemainingBalanceModel,
  checkDuplicateWalletReferenceModel,
};

