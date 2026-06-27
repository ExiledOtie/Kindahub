// models/dashboardModel.js

const db = require("../config/db");

/**
 * ============================================
 * SUPER ADMIN SUMMARY
 * ============================================
 */
const getAdminSummary = async () => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users WHERE role='member')::INT AS members,

      (SELECT COUNT(*) FROM groups)::INT AS groups,

      (SELECT COUNT(*) FROM loans
        WHERE LOWER(status)='pending')::INT AS "pendingLoans",

      (SELECT COUNT(*) FROM loans
        WHERE LOWER(status)='approved')::INT AS "approvedLoans",

      (
        SELECT COALESCE(SUM(amount),0)
        FROM savings
        WHERE DATE_TRUNC('month',created_at)
            = DATE_TRUNC('month',CURRENT_DATE)
      ) AS "monthlySavings",

      (
        SELECT COALESCE(SUM(amount),0)
        FROM contributions
        WHERE DATE_TRUNC('month',created_at)
            = DATE_TRUNC('month',CURRENT_DATE)
      ) AS "monthlyContributions",

      (
        SELECT COALESCE(
          SUM(total_payable - amount),
          0
        )
        FROM loans
        WHERE LOWER(status)='approved'
      ) AS "chamaWallet",

      (
        SELECT COUNT(*)
        FROM notifications
        WHERE is_read=false
      )::INT AS notifications;
  `;

  const { rows } = await db.query(query);

  return rows[0];
};

/**
 * ============================================
 * MEMBER SUMMARY
 * ============================================
 */
const getMemberSummary = async (userId) => {
  const query = `
    SELECT

      (
        SELECT COALESCE(SUM(amount),0)
        FROM savings
        WHERE user_id=$1
      ) AS "mySavings",

      (
        SELECT COALESCE(SUM(amount),0)
        FROM contributions
        WHERE user_id=$1
      ) AS "myContributions",

      (
        SELECT COUNT(*)
        FROM loans
        WHERE user_id=$1
      )::INT AS "myLoans",

      (
        SELECT COUNT(*)
        FROM loans
        WHERE user_id=$1
        AND LOWER(status)='pending'
      )::INT AS "pendingLoans",

      (
        SELECT COUNT(*)
        FROM loans
        WHERE user_id=$1
        AND LOWER(status)='approved'
      )::INT AS "approvedLoans",

      (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id=$1
        AND is_read=false
      )::INT AS notifications;
  `;

  const { rows } = await db.query(query, [userId]);

  return rows[0];
};

/**
 * ============================================
 * ADMIN LOAN CHART
 * ============================================
 */
const getAdminLoanChart = async () => {
  const query = `
    SELECT
      TO_CHAR(created_at,'Mon') AS month,
      COALESCE(SUM(amount),0) AS amount
    FROM loans
    WHERE created_at >= DATE_TRUNC('year',CURRENT_DATE)
    GROUP BY
      EXTRACT(MONTH FROM created_at),
      TO_CHAR(created_at,'Mon')
    ORDER BY
      EXTRACT(MONTH FROM created_at);
  `;

  const { rows } = await db.query(query);

  return rows;
};

/**
 * ============================================
 * MEMBER LOAN CHART
 * ============================================
 */
const getMemberLoanChart = async (userId) => {
  const query = `
    SELECT
      TO_CHAR(created_at,'Mon') AS month,
      COALESCE(SUM(amount),0) AS amount
    FROM loans
    WHERE user_id=$1
      AND created_at >= DATE_TRUNC('year',CURRENT_DATE)
    GROUP BY
      EXTRACT(MONTH FROM created_at),
      TO_CHAR(created_at,'Mon')
    ORDER BY
      EXTRACT(MONTH FROM created_at);
  `;

  const { rows } = await db.query(query, [userId]);

  return rows;
};

/**
 * ============================================
 * ADMIN SAVINGS CHART
 * ============================================
 */
const getAdminSavingsChart = async () => {
  const query = `
    SELECT
      TO_CHAR(created_at,'Mon') AS month,
      COALESCE(SUM(amount),0) AS amount
    FROM savings
    WHERE created_at >= DATE_TRUNC('year',CURRENT_DATE)
    GROUP BY
      EXTRACT(MONTH FROM created_at),
      TO_CHAR(created_at,'Mon')
    ORDER BY
      EXTRACT(MONTH FROM created_at);
  `;

  const { rows } = await db.query(query);

  return rows;
};

/**
 * ============================================
 * MEMBER SAVINGS CHART
 * ============================================
 */
const getMemberSavingsChart = async (userId) => {
  const query = `
    SELECT
      TO_CHAR(created_at,'Mon') AS month,
      COALESCE(SUM(amount),0) AS amount
    FROM savings
    WHERE user_id=$1
      AND created_at >= DATE_TRUNC('year',CURRENT_DATE)
    GROUP BY
      EXTRACT(MONTH FROM created_at),
      TO_CHAR(created_at,'Mon')
    ORDER BY
      EXTRACT(MONTH FROM created_at);
  `;

  const { rows } = await db.query(query, [userId]);

  return rows;
};

/**
 * ============================================
 * RECENT ACTIVITIES
 * ============================================
 */
const getRecentActivities = async (limit = 10) => {
  const query = `
      SELECT *
      FROM (

          SELECT
              s.created_at,
              'Saving' AS type,
              CONCAT(u.fullname,' saved KES ',s.amount) AS description
          FROM savings s
          JOIN users u
            ON u.id=s.user_id

          UNION ALL

          SELECT
              c.created_at,
              'Contribution',
              CONCAT(u.fullname,' contributed KES ',c.amount)
          FROM contributions c
          JOIN users u
            ON u.id=c.user_id

          UNION ALL

          SELECT
              l.created_at,
              'Loan',
              CONCAT(
                  u.fullname,
                  ' requested KES ',
                  l.amount
              )
          FROM loans l
          JOIN users u
            ON u.id=l.user_id

          UNION ALL

          SELECT
              a.created_at,
              'Announcement',
              a.title
          FROM announcements a

      ) activity

      ORDER BY created_at DESC
      LIMIT $1;
  `;

  const { rows } = await db.query(query, [limit]);

  return rows;
};

/**
 * ============================================
 * MEMBER RECENT ACTIVITIES
 * ============================================
 */
const getMemberRecentActivities = async (userId, limit = 10) => {
  const query = `
    SELECT *
    FROM (

      SELECT
        s.created_at,
        'Saving' AS type,
        CONCAT('You saved KES ',s.amount) AS description
      FROM savings s
      WHERE s.user_id=$1

      UNION ALL

      SELECT
        c.created_at,
        'Contribution',
        CONCAT('You contributed KES ',c.amount)
      FROM contributions c
      WHERE c.user_id=$1

      UNION ALL

      SELECT
        l.created_at,
        'Loan',
        CONCAT(
          'Loan request of KES ',
          l.amount,
          ' (',
          l.status,
          ')'
        )
      FROM loans l
      WHERE l.user_id=$1

      UNION ALL

      SELECT
        a.created_at,
        'Announcement',
        a.title
      FROM announcements a
      JOIN user_groups ug
        ON ug.group_id=a.group_id
      WHERE ug.user_id=$1

    ) activity

    ORDER BY created_at DESC

    LIMIT $2;
  `;

  const { rows } = await db.query(query, [userId, limit]);

  return rows;
};

/**
 * ============================================
 * MONTHLY LOAN CHART
 * ============================================
 */
const getLoanChart = async () => {
  const query = `
      SELECT

      TO_CHAR(created_at,'Mon') AS month,

      COALESCE(SUM(amount),0) AS amount

      FROM loans

      WHERE created_at >=
      DATE_TRUNC('year',CURRENT_DATE)

      GROUP BY
      EXTRACT(MONTH FROM created_at),
      TO_CHAR(created_at,'Mon')

      ORDER BY
      EXTRACT(MONTH FROM created_at);
  `;

  const { rows } = await db.query(query);

  return rows;
};

/**
 * ============================================
 * MONTHLY SAVINGS CHART
 * ============================================
 */
const getSavingsChart = async () => {
  const query = `
      SELECT

      TO_CHAR(created_at,'Mon') AS month,

      COALESCE(SUM(amount),0) AS amount

      FROM savings

      WHERE created_at >=
      DATE_TRUNC('year',CURRENT_DATE)

      GROUP BY
      EXTRACT(MONTH FROM created_at),
      TO_CHAR(created_at,'Mon')

      ORDER BY
      EXTRACT(MONTH FROM created_at);
  `;

  const { rows } = await db.query(query);

  return rows;
};
const getRecentLoanRequests = async (limit = 5) => {
  const query = `
    SELECT
      l.id,
      u.fullname,
      l.amount,
      l.status,
      l.created_at
    FROM loans l
    JOIN users u ON u.id = l.user_id
    ORDER BY l.created_at DESC
    LIMIT $1;
  `;

  const { rows } = await db.query(query, [limit]);

  return rows;
};

const getRecentContributions = async (limit = 5) => {
  const query = `
    SELECT
      c.id,
      u.fullname,
      c.amount,
      c.status,
      c.created_at,
      'Monthly' AS type
    FROM contributions c
    JOIN users u
      ON u.id = c.user_id
    ORDER BY c.created_at DESC
    LIMIT $1;
  `;

  const { rows } = await db.query(query, [limit]);

  return rows;
};

const getOverdueLoans = async (limit = 5) => {
  const query = `
    SELECT
      l.id,
      u.fullname,
      l.amount,
      l.balance,
      l.approved_at
    FROM loans l
    JOIN users u
      ON u.id = l.user_id
    WHERE
      LOWER(l.status)='approved'
      AND l.balance > 0
    ORDER BY l.approved_at ASC
    LIMIT $1;
  `;

  const { rows } = await db.query(query, [limit]);

  return rows;
};

const getLoanStatusDistribution = async () => {
  const query = `
    SELECT
      status,
      COUNT(*)::INT AS value
    FROM loans
    GROUP BY status;
  `;

  const { rows } = await db.query(query);

  const colors = {
    approved: "#4f46e5",
    pending: "#f59e0b",
    rejected: "#ef4444",
    repaid: "#10b981",
  };

  return rows.map((item) => ({
    name:
      item.status.charAt(0).toUpperCase() +
      item.status.slice(1),
    value: Number(item.value),
    color: colors[item.status] || "#94a3b8",
  }));
};
const getMemberRecentLoanRequests = async (
  userId,
  limit = 5
) => {
  const query = `
    SELECT
      l.id,
      u.fullname,
      l.amount,
      l.status,
      l.created_at
    FROM loans l
    JOIN users u
      ON u.id=l.user_id
    WHERE l.user_id=$1
    ORDER BY l.created_at DESC
    LIMIT $2;
  `;

  const { rows } = await db.query(query,[userId,limit]);

  return rows;
};

const getMemberRecentContributions = async (
  userId,
  limit = 5
) => {
  const query = `
    SELECT
      c.id,
      u.fullname,
      c.amount,
      c.status,
      c.created_at,
      'Monthly' AS type
    FROM contributions c
    JOIN users u
      ON u.id=c.user_id
    WHERE c.user_id=$1
    ORDER BY c.created_at DESC
    LIMIT $2;
  `;

  const { rows } = await db.query(query,[userId,limit]);

  return rows;
};

const getMemberLoanStatusDistribution = async (
  userId
) => {

  const query = `
      SELECT
        status,
        COUNT(*)::INT AS value
      FROM loans
      WHERE user_id=$1
      GROUP BY status;
  `;

  const { rows } = await db.query(query,[userId]);

  const colors = {
      approved:"#4f46e5",
      pending:"#f59e0b",
      rejected:"#ef4444",
      repaid:"#10b981"
  };

  return rows.map(item=>({

      name:
      item.status.charAt(0).toUpperCase()+
      item.status.slice(1),

      value:Number(item.value),

      color:colors[item.status] || "#94a3b8"

  }));

};

module.exports = {
  getAdminSummary,
  getMemberSummary,
  getAdminLoanChart,
  getMemberLoanChart,
  getAdminSavingsChart,
  getMemberSavingsChart,
  getRecentActivities,
  getMemberRecentActivities,
  getLoanChart,
  getSavingsChart,
  getRecentLoanRequests,
  getMemberRecentLoanRequests,
  getRecentContributions,
  getMemberRecentContributions,
  getOverdueLoans,
  getLoanStatusDistribution,
  getMemberLoanStatusDistribution,
};