const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE CONTRIBUTION
|--------------------------------------------------------------------------
*/

const createContributionModel = async (
  memberId,
  amount,
  method,
  mpesaCode,
  createdBy
) => {
  const result = await pool.query(
    `
    INSERT INTO contributions
    (
      member_id,
      amount,
      method,
      mpesa_code,
      created_by
    )

    VALUES ($1,$2,$3,$4,$5)

    RETURNING *
    `,
    [
      memberId,
      amount,
      method,
      mpesaCode,
      createdBy,
    ]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET MEMBER CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const getMemberContributionsModel =
  async (memberId) => {
    const result = await pool.query(
      `
      SELECT
        c.*,
        u.fullname

      FROM contributions c

      INNER JOIN users u
        ON u.id = c.member_id

      WHERE c.member_id = $1

      ORDER BY c.created_at DESC
      `,
      [memberId]
    );

    return result.rows;
  };

/*
|--------------------------------------------------------------------------
| DELETE CONTRIBUTION
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
  getMemberContributionsModel,
  deleteContributionModel,
};