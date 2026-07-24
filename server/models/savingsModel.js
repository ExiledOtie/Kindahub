const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE SAVING
|--------------------------------------------------------------------------
*/

const createSavingModel = async (
  userId,
  groupId,
  amount,
  paymentMethod,
  mpesaCode,
  bankReference,
  createdBy,
  status = "completed"
) => {
  const result = await pool.query(
    `
    INSERT INTO savings
    (
      user_id,
      group_id,
      amount,
      payment_method,
      mpesa_code,
      bank_reference,
      created_by,
      status
    )

    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

    RETURNING *
    `,
    [userId, groupId, amount, paymentMethod, mpesaCode, bankReference, createdBy, status],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET ALL SAVINGS
|--------------------------------------------------------------------------
*/

const getAllSavingsModel = async () => {
  const result = await pool.query(
    `
    SELECT
      s.*,
      u.fullname,
      u.username,
      g.name AS group_name

    FROM savings s

    INNER JOIN users u
      ON u.id = s.user_id

    INNER JOIN groups g
      ON g.id = s.group_id

    ORDER BY s.created_at DESC
    `,
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET USER SAVINGS
|--------------------------------------------------------------------------
*/

const getUserSavingsModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      s.*,
      u.fullname,
      u.username,
      g.name AS group_name

    FROM savings s

    INNER JOIN users u
      ON u.id = s.user_id

    INNER JOIN groups g
      ON g.id = s.group_id

    WHERE s.user_id = $1

    ORDER BY s.created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SAVING
|--------------------------------------------------------------------------
*/

const getSingleSavingModel = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM savings
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| SAVINGS STATS
|--------------------------------------------------------------------------
*/
const getSavingsStatsModel = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed') AS total_transactions,

      COALESCE(
        SUM(amount) FILTER (WHERE status = 'completed'),
        0
      ) AS total_savings

    FROM savings
  `);

  return result.rows[0];
};

const approveSavingModel = async (savingId) => {
  const result = await pool.query(
    `
    UPDATE savings
    SET status = 'completed'
    WHERE id = $1
    RETURNING *
    `,
    [savingId],
  );

  return result.rows[0];
};

const rejectSavingModel = async (savingId) => {
  const result = await pool.query(
    `
    UPDATE savings
    SET status = 'rejected'
    WHERE id = $1
    RETURNING *
    `,
    [savingId],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| DELETE SAVING
|--------------------------------------------------------------------------
*/

const deleteSavingModel = async (id) => {
  await pool.query(
    `
    DELETE FROM savings
    WHERE id = $1
    `,
    [id],
  );

  return true;
};

module.exports = {
  createSavingModel,
  getAllSavingsModel,
  getUserSavingsModel,
  getSingleSavingModel,
  getSavingsStatsModel,
  approveSavingModel,
  rejectSavingModel,
  deleteSavingModel,
};
