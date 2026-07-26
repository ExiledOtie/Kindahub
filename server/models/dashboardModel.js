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

    /* ============================
       BASIC COUNTS
    ============================ */

    (
      SELECT COUNT(*)
      FROM users
      WHERE role='member'
    )::INT AS members,

    (
      SELECT COUNT(*)
      FROM groups
    )::INT AS groups,

    (
      SELECT COUNT(*)
      FROM loans
      WHERE LOWER(status)='pending'
    )::INT AS "pendingLoans",

    (
      SELECT COUNT(*)
      FROM loans
      WHERE LOWER(status)='approved'
    )::INT AS "approvedLoans",

/* ============================
   SAVINGS
============================ */

(
  SELECT COALESCE(SUM(amount),0)
  FROM savings
  WHERE LOWER(status)='completed'
) AS "totalSavings",

(
  SELECT COALESCE(SUM(amount),0)
  FROM savings
  WHERE LOWER(status)='completed'
    AND DATE_TRUNC('month',created_at)
        = DATE_TRUNC('month',CURRENT_DATE)
) AS "monthlySavings",

    /* ============================
       CONTRIBUTIONS
    ============================ */

  (
  SELECT COALESCE(SUM(amount),0)
  FROM contributions
  WHERE LOWER(status)='completed'
    AND DATE_TRUNC('month',created_at)
        = DATE_TRUNC('month',CURRENT_DATE)
) AS "monthlyContributions",

(
  SELECT COALESCE(SUM(c.amount),0)
  FROM contributions c
  JOIN user_groups ug
    ON ug.user_id = c.user_id
  JOIN groups g
    ON g.id = ug.group_id
  WHERE LOWER(g.name)='kinda family'
    AND LOWER(c.status)='completed'
) AS "kindaFamilyContributions",

(
  SELECT COALESCE(SUM(c.amount),0)
  FROM contributions c
  JOIN user_groups ug
    ON ug.user_id = c.user_id
  JOIN groups g
    ON g.id = ug.group_id
  WHERE LOWER(g.name)='13 amigos'
    AND LOWER(c.status)='completed'
) AS "amigosContributions",

    /* ============================
       LOANS
    ============================ */

    (
      SELECT COALESCE(SUM(balance),0)
      FROM loans
      WHERE LOWER(status)='approved'
        AND balance > 0
    ) AS "activeLoans",

    /* ============================
       CHAMA WALLET
       (Total Interest Collected)
    ============================ */

    (
      SELECT COALESCE(SUM(interest_paid),0)
      FROM loan_payments
    ) AS "chamaWallet",

    /* ============================
       NOTIFICATIONS
    ============================ */

    (
      SELECT COUNT(*)
      FROM notifications
      WHERE is_read = false
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

      -- Total Savings
(
  SELECT COALESCE(SUM(amount),0)
  FROM savings
  WHERE user_id = $1
    AND LOWER(status)='completed'
) AS "mySavings",

      -- Total Contributions
(
    SELECT COALESCE(SUM(amount),0)
    FROM contributions
    WHERE user_id = $1
      AND LOWER(status)='completed'
) AS "myContributions",

      -- Active Loan Amount (Approved Loans Only)
      (
        SELECT COALESCE(SUM(amount),0)
        FROM loans
        WHERE user_id = $1
          AND LOWER(status) = 'approved'
      ) AS "activeLoanAmount",

      -- Remaining Loan Balance
      (
        SELECT COALESCE(SUM(balance),0)
        FROM loans
        WHERE user_id = $1
          AND LOWER(status) = 'approved'
          AND balance > 0
      ) AS "loanBalanceRemaining",

      -- Total Interest Paid
      (
        SELECT COALESCE(SUM(interest_paid),0)
        FROM loan_payments lp
        INNER JOIN loans l
          ON l.id = lp.loan_id
        WHERE l.user_id = $1
      ) AS "totalInterestPaid",

      -- Unread Notifications
      (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = $1
          AND is_read = false
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

  WHERE
    LOWER(status)='completed'
    AND created_at >= DATE_TRUNC('year',CURRENT_DATE)

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

  WHERE
    user_id=$1
    AND LOWER(status)='completed'
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
WHERE LOWER(s.status)='completed'

          UNION ALL

 SELECT
    c.created_at,
    'Contribution',
    CONCAT(u.fullname,' contributed KES ',c.amount)
FROM contributions c
JOIN users u
  ON u.id=c.user_id
WHERE LOWER(c.status)='completed'

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
  AND LOWER(s.status)='completed'

      UNION ALL

      SELECT
        c.created_at,
        'Contribution',
        CONCAT('You contributed KES ',c.amount)
      FROM contributions c
      WHERE c.user_id=$1
        AND LOWER(c.status)='completed'

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

  WHERE
    LOWER(status)='completed'
    AND created_at >= DATE_TRUNC('year',CURRENT_DATE)

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

const getRecentContributions = async () => {
  const query = `
   SELECT
  c.id,
  u.fullname AS "memberName",
  INITCAP(c.payment_method) AS type,
  c.amount,
  c.mpesa_code,
  c.bank_reference,
  c.created_at AS date,
  INITCAP(c.status) AS status

    FROM contributions c

    INNER JOIN users u
      ON u.id = c.user_id

    ORDER BY c.created_at DESC

    LIMIT 8;
  `;

  const { rows } = await db.query(query);

  return rows;
};

const getOverdueLoans = async (limit = 5) => {
  const query = `
    SELECT
      l.id,
      u.fullname AS "memberName",
      l.amount AS "loanAmount",

      (
        l.amount +
        ((l.amount * l.interest_rate) / 100)
        -
        COALESCE(
          (
            SELECT SUM(lp.amount)
            FROM loan_payments lp
            WHERE lp.loan_id = l.id
          ),
          0
        )
      ) AS balance,

      l.approved_at AS "overdueSince"

    FROM loans l

    INNER JOIN users u
      ON u.id = l.user_id

    WHERE LOWER(l.status) = 'approved'

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
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: Number(item.value),
    color: colors[item.status] || "#94a3b8",
  }));
};

const getMemberRecentLoanRequests = async (userId, limit = 5) => {
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

  const { rows } = await db.query(query, [userId, limit]);

  return rows;
};

const getMemberRecentContributions = async (userId, limit = 5) => {
  const query = `
    SELECT
  c.id,
  u.fullname,
  c.amount,
  c.payment_method,
  c.mpesa_code,
  c.bank_reference,
  c.status,
  c.created_at AS date,
  'Monthly' AS type
    FROM contributions c
    JOIN users u
      ON u.id = c.user_id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
    LIMIT $2;
  `;

  const { rows } = await db.query(query, [userId, limit]);

  return rows;
};

const getMemberLoanStatusDistribution = async (userId) => {
  const query = `
      SELECT
        status,
        COUNT(*)::INT AS value
      FROM loans
      WHERE user_id=$1
      GROUP BY status;
  `;

  const { rows } = await db.query(query, [userId]);

  const colors = {
    approved: "#4f46e5",
    pending: "#f59e0b",
    rejected: "#ef4444",
    repaid: "#10b981",
  };

  return rows.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),

    value: Number(item.value),

    color: colors[item.status] || "#94a3b8",
  }));
};

/*
|--------------------------------------------------------------------------
| GROUP CONTRIBUTIONS CHART (JAN - DEC)
|--------------------------------------------------------------------------
*/

const getGroupContributionChart = async (year = new Date().getFullYear()) => {
  const query = `
    WITH months AS (
      SELECT generate_series(1,12) AS month_no
    )

    SELECT
      TO_CHAR(
        TO_DATE(months.month_no::text,'MM'),
        'Mon'
      ) AS month,

      COALESCE((
        SELECT SUM(c.amount)
        FROM contributions c
        JOIN user_groups ug
          ON ug.user_id = c.user_id
        JOIN groups g
          ON g.id = ug.group_id
        WHERE
          LOWER(g.name) = 'kinda family'
          AND LOWER(c.status)='completed'
          AND EXTRACT(MONTH FROM c.created_at) = months.month_no
          AND EXTRACT(YEAR FROM c.created_at) = $1
      ),0) AS "kindaFamily",

      COALESCE((
        SELECT SUM(c.amount)
        FROM contributions c
        JOIN user_groups ug
          ON ug.user_id = c.user_id
        JOIN groups g
          ON g.id = ug.group_id
        WHERE
          LOWER(g.name) = '13 amigos'
          AND LOWER(c.status)='completed'
          AND EXTRACT(MONTH FROM c.created_at) = months.month_no
          AND EXTRACT(YEAR FROM c.created_at) = $1
      ),0) AS amigos

    FROM months

    ORDER BY months.month_no;
  `;

  const { rows } = await db.query(query, [year]);

  return rows.map((row) => ({
    month: row.month,
    kindaFamily: Number(row.kindaFamily),
    amigos: Number(row.amigos),
  }));
};

/*
|--------------------------------------------------------------------------
| MEMBER LOAN REPAYMENT PROGRESS
|--------------------------------------------------------------------------
*/

const getMemberLoanProgress = async (userId) => {
  const query = `
    SELECT
      l.id,

      l.amount AS principal,

      l.interest_rate,

      (
        l.amount +
        ((l.amount * l.interest_rate) / 100)
      ) AS "totalPayable",

      COALESCE(
        SUM(lp.principal_paid + lp.interest_paid),
        0
      ) AS "totalPaid",

      COALESCE(
        MIN(lp.balance_after),
        (
          l.amount +
          ((l.amount * l.interest_rate) / 100)
        )
      ) AS balance

    FROM loans l

    LEFT JOIN loan_payments lp
      ON lp.loan_id = l.id

    WHERE l.user_id = $1
      AND LOWER(l.status) = 'approved'

    GROUP BY
      l.id,
      l.amount,
      l.interest_rate,
      l.approved_at

    ORDER BY l.approved_at DESC

    LIMIT 1;
  `;

  const { rows } = await db.query(query, [userId]);

  return (
    rows[0] || {
      totalPayable: 0,
      totalPaid: 0,
      balance: 0,
    }
  );
};

const getMemberUpcomingAnnouncement = async (userId) => {
  const query = `
    SELECT
      a.id,
      a.title,
      a.description,
      a.announcement_date,
      a.meeting_time,
      a.venue,
      a.host,
      a.type,
      a.status

    FROM announcements a

    INNER JOIN user_groups ug
      ON ug.group_id = a.group_id

    WHERE ug.user_id = $1
      AND a.status = 'scheduled'
      AND a.announcement_date >= CURRENT_DATE

    ORDER BY a.announcement_date ASC

    LIMIT 1;
  `;

  const { rows } = await db.query(query, [userId]);

  return rows[0] || null;
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
  getGroupContributionChart,
  getRecentContributions,
  getMemberRecentContributions,
  getOverdueLoans,
  getLoanStatusDistribution,
  getMemberLoanStatusDistribution,
  getMemberLoanProgress,
  getMemberUpcomingAnnouncement,
};
