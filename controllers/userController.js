const bcrypt = require('bcrypt');
const { pool } = require('../connectDB');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const asyncWrapper = require('../middleware/asyncHandler');

// @desc    Get all users
// @endpoint   GET /api/v1/users
// @access  Private/admin

const getAllUsers = asyncWrapper(async (req, res) => {
  const getUsersQuery = 'SELECT * FROM users';
  const { rows } = await pool.query(getUsersQuery);

  // Remove password from each user object
  for (let i = 0; i < rows.length; i++) {
    rows[i].password = undefined;
  }

  res.status(StatusCodes.OK).json({ users: rows });
});

// @desc    Get single user
// @endpoint   GET /api/v1/users/:id
// @access  Private

const getSingleUser = asyncWrapper(async (req, res) => {
  const { id: userId } = req.params;

  const getUserQuery = 'SELECT * FROM users WHERE id = $1';
  const { rows } = await pool.query(getUserQuery, [userId]);

  if (rows.length === 0) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }

  const user = rows[0];
  user.password = undefined;

  res.status(StatusCodes.OK).json({ user });
});

// @desc    Update user
// @endpoint   PATCH /api/v1/users/:id
// @access  Private

const updateUser = asyncWrapper(async (req, res) => {
  const { name, email } = req.body;
  const currentUser = req.user.id;

  //check if its user's own data
  if (!currentUser) {
    throw new CustomError.UnauthorizedError(
      'Not authorized to update this user'
    );
  }

  const updateUserQuery =
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *';
  const { rows } = await pool.query(updateUserQuery, [
    name,
    email,
    currentUser,
  ]);

  if (rows.length === 0) {
    throw new CustomError.NotFoundError(`No user with id : ${currentUser}`);
  }

  const user = rows[0];
  user.password = undefined;

  res.status(StatusCodes.OK).json({ user });
});

// @desc    Update password
// @endpoint   PATCH /api/v1/users/update-password
// @access  Private

const updatePassword = asyncWrapper(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  console.log(oldPassword, newPassword);
  const userId = req.user.id;

  const selectQuery = 'SELECT * FROM users WHERE id = $1';
  const selectRes = await pool.query(selectQuery, [userId]);

  if (selectRes.rows.length === 0) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }
  const userData = selectRes.rows[0];

  const isMatch = await bcrypt.compare(oldPassword, userData.password);

  if (!isMatch) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  // Hash new password and  update in db
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updateQuery = 'UPDATE users SET password = $1 WHERE id = $2';
  await pool.query(updateQuery, [hashedPassword, userId]);

  res.status(StatusCodes.OK).json({ msg: 'Password updated' });
});

// @desc    get current user
// @endpoint   get -- from http-only-Cookie req
// @access  Private

const getCurrentUser = asyncWrapper(async (req, res) => {
  const id = req.user.id;

  if (!user) {
    throw new CustomError.NotFoundError('No user found');
  }

  if (typeof user.id !== 'number') {
    throw new CustomError.BadRequestError('Invalid user ID');
  }

  const selectQuery = 'SELECT * FROM users WHERE id = $1';
  const selectRes = await pool.query(selectQuery, [id]);

  if (selectRes.rows.length === 0) {
    throw new CustomError.NotFoundError(`No user with id : ${id}`);
  }
  const user = selectRes.rows[0];

  res.status(StatusCodes.OK).json(user);
});

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updatePassword,
  getCurrentUser,
};
