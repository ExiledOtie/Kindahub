const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE WALLET
|--------------------------------------------------------------------------
*/

const createWalletModel = async (userId) => {
  const result = await pool.query(
    `
    INSERT INTO member_credit_wallet
    (
      user_id,
      balance
    )

    VALUES ($1,0)

    ON CONFLICT (user_id)
    DO NOTHING

    RETURNING *
    `,
    [userId]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET MEMBER WALLET
|--------------------------------------------------------------------------
*/

const getWalletModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM member_credit_wallet
    WHERE user_id=$1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    await createWalletModel(userId);

    const wallet = await pool.query(
      `
      SELECT *
      FROM member_credit_wallet
      WHERE user_id=$1
      `,
      [userId]
    );

    return wallet.rows[0];
  }

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| CREDIT WALLET
|--------------------------------------------------------------------------
*/

const creditWalletModel = async (
  userId,
  amount,
  loanId = null,
  description = "Loan overpayment"
) => {
  await createWalletModel(userId);

  const wallet = await pool.query(
    `
    UPDATE member_credit_wallet

    SET
      balance = balance + $2,
      updated_at = NOW()

    WHERE user_id=$1

    RETURNING *
    `,
    [userId, amount]
  );

  await pool.query(
    `
    INSERT INTO member_credit_transactions
    (
      user_id,
      loan_id,
      amount,
      transaction_type,
      description
    )

    VALUES
    (
      $1,
      $2,
      $3,
      'credit',
      $4
    )
    `,
    [userId, loanId, amount, description]
  );

  return wallet.rows[0];
};

/*
|--------------------------------------------------------------------------
| DEBIT WALLET
|--------------------------------------------------------------------------
*/

const debitWalletModel = async (
  userId,
  amount,
  loanId = null,
  description = "Applied to loan"
) => {
  await createWalletModel(userId);

  const walletResult = await pool.query(
    `
    SELECT *
    FROM member_credit_wallet
    WHERE user_id=$1
    `,
    [userId]
  );

  const wallet = walletResult.rows[0];

  if (!wallet) return null;

  const debitAmount = Math.min(Number(wallet.balance), Number(amount));

  await pool.query(
    `
    UPDATE member_credit_wallet

    SET
      balance = balance - $2,
      updated_at = NOW()

    WHERE user_id=$1
    `,
    [userId, debitAmount]
  );

  await pool.query(
    `
    INSERT INTO member_credit_transactions
    (
      user_id,
      loan_id,
      amount,
      transaction_type,
      description
    )

    VALUES
    (
      $1,
      $2,
      $3,
      'debit',
      $4
    )
    `,
    [userId, loanId, debitAmount, description]
  );

  return debitAmount;
};

/*
|--------------------------------------------------------------------------
| GET WALLET TRANSACTIONS
|--------------------------------------------------------------------------
*/

const getWalletTransactionsModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      t.*,
      l.id AS loan_number

    FROM member_credit_transactions t

    LEFT JOIN loans l
      ON l.id = t.loan_id

    WHERE t.user_id=$1

    ORDER BY t.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET ALL WALLETS
|--------------------------------------------------------------------------
*/

const getAllWalletsModel = async () => {
  const result = await pool.query(
    `
    SELECT

      w.*,

      u.fullname,
      u.username

    FROM member_credit_wallet w

    INNER JOIN users u
      ON u.id = w.user_id

    ORDER BY balance DESC
    `
  );

  return result.rows;
};

module.exports = {
  createWalletModel,
  getWalletModel,
  creditWalletModel,
  debitWalletModel,
  getWalletTransactionsModel,
  getAllWalletsModel,
};