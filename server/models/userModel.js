// models/userModel.js

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
  username
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
    [
      fullname,
      email,
      phone,
      password,
      role,
      username,
    ]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
*/

const getAllUsersModel = async () => {

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

    ORDER BY id DESC
    `
  );

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
    [id]
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
    [email]
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
    [username]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/

const updateUserModel = async (
  id,
  fullname,
  email,
  phone,
  role,
  status
) => {

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
    [
      fullname,
      email,
      phone,
      role,
      status,
      id,
    ]
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
    [id]
  );

  return true;
};

module.exports = {
  createUserModel,
  getAllUsersModel,
  getSingleUserModel,
  findUserByEmailModel,
  findUserByUsernameModel,
  updateUserModel,
  deleteUserModel,
};