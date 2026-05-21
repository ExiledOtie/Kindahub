const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| CREATE GROUP
|--------------------------------------------------------------------------
*/

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

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

/*
|--------------------------------------------------------------------------
| GET ALL GROUPS
|--------------------------------------------------------------------------
*/

const getGroups = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM groups
      ORDER BY name ASC
    `);

    res.status(200).json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }
};

module.exports = {
  createGroup,
  getGroups,
};