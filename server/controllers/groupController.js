const pool = require("../config/db");

const createGroup = async (req, res) => {
  try {

    const {
      name,
      description,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO groups
      (
        name,
        description,
        created_by
      )

      VALUES ($1, $2, $3)

      RETURNING *
      `,
      [
        name,
        description,
        req.user.id,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createGroup,
};