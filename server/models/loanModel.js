const pool = require("../config/db");

class Loan {
  static async create(data) {
    const {
      user_id,
      group_id,
      amount,
      purpose,
      interest_rate,
      duration_months,
    } = data;

    const query = `
      INSERT INTO loans (
        user_id,
        group_id,
        amount,
        purpose,
        interest_rate,
        duration_months
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
    `;

    const values = [
      user_id,
      group_id,
      amount,
      purpose,
      interest_rate,
      duration_months,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT
        l.*,
        u.first_name,
        u.last_name,
        g.name AS group_name
      FROM loans l
      JOIN users u ON l.user_id = u.id
      JOIN groups g ON l.group_id = g.id
      ORDER BY l.created_at DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT
        l.*,
        u.first_name,
        u.last_name,
        g.name AS group_name
      FROM loans l
      JOIN users u ON l.user_id = u.id
      JOIN groups g ON l.group_id = g.id
      WHERE l.id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getMemberLoans(userId) {
    const query = `
      SELECT *
      FROM loans
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async approve(id, approvedBy) {
    const query = `
      UPDATE loans
      SET
        status = 'approved',
        approved_by = $2,
        approved_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id, approvedBy]);
    return result.rows[0];
  }

  static async reject(id) {
    const query = `
      UPDATE loans
      SET status = 'rejected'
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE loans
      SET status = $2
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id, status]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM loans
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT
        COUNT(*) AS total_loans,
        COUNT(*) FILTER (WHERE status='approved') AS approved_loans,
        COUNT(*) FILTER (WHERE status='pending') AS pending_loans,
        COALESCE(SUM(amount),0) AS total_amount
      FROM loans;
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Loan;