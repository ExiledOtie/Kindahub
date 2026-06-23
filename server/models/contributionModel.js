const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE CONTRIBUTION
|--------------------------------------------------------------------------
*/

const createContributionModel = async (
  userId,
  groupId,
  amount,
  paymentMethod,
  mpesaCode,
  createdBy,
  status = "pending"
) => {
  const result = await pool.query(
    `
    INSERT INTO contributions
    (
      user_id,
      group_id,
      amount,
      payment_method,
      mpesa_code,
      created_by,
      status
    )

    VALUES ($1,$2,$3,$4,$5,$6,$7)

    RETURNING *
    `,
    [
      userId,
      groupId,
      amount,
      paymentMethod,
      mpesaCode,
      createdBy,
      status,
    ]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET SINGLE USER CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const getUserContributionsModel = async (
  userId
) => {
  const result = await pool.query(
    `
    SELECT
      c.*,
      u.fullname,
      g.name as group_name

    FROM contributions c

    INNER JOIN users u
      ON u.id = c.user_id

    LEFT JOIN groups g
      ON g.id = c.group_id

    WHERE c.user_id = $1

    ORDER BY c.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET ALL CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const getAllContributionsModel = async () => {
  const result = await pool.query(
    `
    SELECT
      c.*,
      u.fullname,
      g.name as group_name

    FROM contributions c

    INNER JOIN users u
      ON u.id = c.user_id

    LEFT JOIN groups g
      ON g.id = c.group_id

    ORDER BY c.created_at DESC
    `
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| DASHBOARD STATS
|--------------------------------------------------------------------------
*/

const getContributionStatsModel =
  async () => {
    const result =
      await pool.query(
        `
        SELECT

        COUNT(*) AS total_contributions,

        COALESCE(
          SUM(amount),
          0
        ) AS total_amount

        FROM contributions
        `
      );

    return result.rows[0];
  };

const approveContributionModel = async (
  contributionId
) => {
  const result = await pool.query(
    `
    UPDATE contributions
    SET status = 'completed'
    WHERE id = $1
    RETURNING *
    `,
    [contributionId]
  );

  return result.rows[0];
};

const rejectContributionModel = async (
  contributionId
) => {
  const result = await pool.query(
    `
    UPDATE contributions
    SET status = 'rejected'
    WHERE id = $1
    RETURNING *
    `,
    [contributionId]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

const deleteContributionModel =
  async (id) => {
    await pool.query(
      `
      DELETE FROM contributions
      WHERE id = $1
      `,
      [id]
    );

    return true;
  };

module.exports = {
  createContributionModel,
  getUserContributionsModel,
  getAllContributionsModel,
  getContributionStatsModel,
  deleteContributionModel,
  approveContributionModel,
  rejectContributionModel,
};