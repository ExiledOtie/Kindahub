const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

const createUserModel = async (
  fullname,
  email,
  phone,
  password,
  role,
  username,
) => {
  const result = await pool.query(
    `
    INSERT INTO users
    (
      fullname,
      email,
      phone,
      password,
      role,
      username
    )

    VALUES ($1, $2, $3, $4, $5, $6)

    RETURNING
      id,
      fullname,
      email,
      phone,
      role,
      username,
      status,
      created_at
    `,
    [fullname, email, phone, password, role, username],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| ASSIGN USER TO GROUP
|--------------------------------------------------------------------------
*/

const assignUserToGroupModel = async (userId, groupId, role = "member") => {
  const result = await pool.query(
    `
    INSERT INTO user_groups
    (
      user_id,
      group_id,
      role
    )

    VALUES ($1, $2, $3)

    RETURNING *
    `,
    [userId, groupId, role],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET USER GROUPS
|--------------------------------------------------------------------------
*/

const getUserGroupsModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      g.id,
      g.name,
      g.description,
      ug.role

    FROM user_groups ug

    INNER JOIN groups g
      ON g.id = ug.group_id

    WHERE ug.user_id = $1
    `,
    [userId],
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET MEMBER PROFILE
|--------------------------------------------------------------------------
*/

const getMemberProfileModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.fullname,
      u.email,
      u.phone,
      u.username,
      u.role,
      u.status,
      u.created_at,

      g.id AS group_id,
      g.name AS group_name,

      ug.role AS group_role

    FROM users u

    LEFT JOIN user_groups ug
      ON ug.user_id = u.id

    LEFT JOIN groups g
      ON g.id = ug.group_id

    WHERE u.id = $1
    `,
    [userId],
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
*/

const getAllUsersModel = async () => {
  const result = await pool.query(`
    SELECT
      u.id,
      u.fullname,
      u.email,
      u.phone,
      u.role,
      u.username,
      u.status,
      u.created_at,

      g.id AS group_id,
      g.name AS group_name

    FROM users u

    LEFT JOIN user_groups ug
      ON ug.user_id = u.id

    LEFT JOIN groups g
      ON g.id = ug.group_id

    ORDER BY u.id DESC
  `);

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
*/

const getSingleUserModel = async (id) => {
  const result = await pool.query(
    `
    SELECT
      id,
      fullname,
      email,
      phone,
      role,
      username,
      status,
      created_at

    FROM users

    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| FIND USER BY EMAIL
|--------------------------------------------------------------------------
*/

const findUserByEmailModel = async (email) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| FIND USER BY USERNAME
|--------------------------------------------------------------------------
*/

const findUserByUsernameModel = async (username) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE username = $1
    `,
    [username],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/

const updateUserModel = async (id, fullname, email, phone, role, status) => {
  const result = await pool.query(
    `
    UPDATE users

    SET
      fullname = $1,
      email = $2,
      phone = $3,
      role = $4,
      status = $5

    WHERE id = $6

    RETURNING
      id,
      fullname,
      email,
      phone,
      role,
      username,
      status,
      created_at
    `,
    [fullname, email, phone, role, status, id],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

const resetPasswordModel = async (userId, hashedPassword) => {
  const result = await pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE id = $2
    RETURNING id
    `,
    [hashedPassword, userId],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/

const deleteUserModel = async (id) => {
  await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    `,
    [id],
  );

  return true;
};

/*
|--------------------------------------------------------------------------
| GET MEMBER SUMMARY
|--------------------------------------------------------------------------
*/

const getMemberSummaryModel = async (userId) => {
  const userResult = await pool.query(
    `
  SELECT
    u.id,
    u.fullname,
    u.email,
    u.phone,
    u.username,
    u.role,
    u.status,
    u.created_at,
    u.last_login,

    g.id AS group_id,
    g.name AS group_name,

    ug.role AS group_role

  FROM users u

  LEFT JOIN user_groups ug
    ON ug.user_id = u.id

  LEFT JOIN groups g
    ON g.id = ug.group_id

  WHERE u.id = $1

  ORDER BY ug.id DESC

  LIMIT 1
  `,
    [userId],
  );

const contributionResult = await pool.query(
  `
    SELECT
      COALESCE(SUM(amount), 0) AS total

    FROM contributions

    WHERE user_id = $1
      AND LOWER(status) = 'completed'
    `,
  [userId],
);

const savingsResult = await pool.query(
  `
    SELECT
      COALESCE(SUM(amount), 0) AS total

    FROM savings

    WHERE user_id = $1
      AND LOWER(status) = 'completed'
    `,
  [userId],
);

  const activeLoansResult = await pool.query(
    `
    SELECT COUNT(*) AS total

    FROM loans

    WHERE user_id = $1
      AND status = 'approved'
    `,
    [userId],
  );

  const walletResult = await pool.query(
    `
  SELECT
    COALESCE(balance,0) AS balance
  FROM member_credit_wallet
  WHERE user_id = $1
  `,
    [userId],
  );

  const activitiesResult = await pool.query(
    `
    SELECT
      'contribution' AS type,
      amount,
      created_at,
      'Contribution of KES ' ||
      TO_CHAR(amount, 'FM999,999,999') ||
      ' added' AS description

    FROM contributions

    WHERE user_id = $1

    UNION ALL

    SELECT
  'saving' AS type,
  amount,
  created_at,
  'Savings of KES ' ||
  TO_CHAR(amount, 'FM999,999,999') ||
  ' added' AS description

FROM savings

WHERE user_id = $1
  AND LOWER(status) = 'completed'

    UNION ALL

    SELECT
      'loan_application' AS type,
      amount,
      created_at,

      CASE
        WHEN status = 'approved' THEN
          'Loan of KES ' ||
          TO_CHAR(amount, 'FM999,999,999') ||
          ' approved'

        WHEN status = 'rejected' THEN
          'Loan of KES ' ||
          TO_CHAR(amount, 'FM999,999,999') ||
          ' rejected'

        ELSE
          'Loan application of KES ' ||
          TO_CHAR(amount, 'FM999,999,999') ||
          ' submitted'
      END AS description

    FROM loans

    WHERE user_id = $1

    UNION ALL

    SELECT
      'loan_payment' AS type,
      lp.amount,
      lp.created_at,
      'Loan repayment of KES ' ||
      TO_CHAR(lp.amount, 'FM999,999,999') ||
      ' made' AS description

    FROM loan_payments lp

    INNER JOIN loans l
      ON l.id = lp.loan_id

    WHERE l.user_id = $1

    ORDER BY created_at DESC

    LIMIT 5
    `,
    [userId],
  );

  const totalContributions = Number(contributionResult.rows[0].total);

  const totalSavings = Number(savingsResult.rows[0].total);

  const activeLoans = Number(activeLoansResult.rows[0].total);

  const walletBalance = Number(walletResult.rows[0]?.balance || 0);

  return {
    user: userResult.rows[0],

    stats: {
      totalContributions,
      totalSavings,

      currentBalance: totalContributions + totalSavings + walletBalance,

      activeLoans,

      walletBalance,
    },

    activities: activitiesResult.rows,
  };
};

const getUserGroups = async (userId) => {
  const query = `
    SELECT
      g.id,
      g.name
    FROM user_groups ug
    INNER JOIN groups g
      ON g.id = ug.group_id
    WHERE ug.user_id = $1
    ORDER BY g.name;
  `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
};

module.exports = {
  createUserModel,
  assignUserToGroupModel,
  getUserGroupsModel,
  getMemberProfileModel,
  getMemberSummaryModel,
  getUserGroups,
  resetPasswordModel,
  getAllUsersModel,
  getSingleUserModel,
  findUserByEmailModel,
  findUserByUsernameModel,
  updateUserModel,
  deleteUserModel,
};
