const bcrypt = require('bcrypt');
const { pool } = require('../connectDB');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const asyncWrapper = require('../middleware/asyncHandler');

// @desc    Register user & get token
// @endpoint   POST /api/v1/auth/register
// @access  Public

const register = asyncWrapper(async (req, res) => {
  const { email, name, password } = req.body;

  // Check if email already exists
  const emailCheckQuery = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
  const { rows: emailCheckRows } = await pool.query(emailCheckQuery, [email]);

  if (emailCheckRows.length > 0) {
    throw new CustomError.BadRequestError('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if first account
  const isFirstAccountQuery = 'SELECT COUNT(*) FROM users';
  const { rows: countRows } = await pool.query(isFirstAccountQuery);
  const isFirstAccount = parseInt(countRows[0].count) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  // Create user
  const createUserQuery =
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
  const { rows: userRows } = await pool.query(createUserQuery, [
    name,
    email,
    hashedPassword,
    role,
  ]);
  const user = userRows[0];

  res.status(StatusCodes.CREATED).json(user);
});

const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const findUserQuery = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
  const { rows } = await pool.query(findUserQuery, [email]);
  const user = rows[0];

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  // Compare provided password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

async function updateUser(req, res) {
  const { userId } = req?.params;
  const { newName, newPassword, newEmail } = req.body;

  const selectQuery = 'SELECT * FROM users WHERE id = $1';

  const selectRes = await pool.query(selectQuery, [userId]);
  if (selectRes.rows.length === 0) {
    console.log('User not found');
    return;
  }
  const userData = selectRes.rows[0];
  const name = newName || userData.name;
  const password = newPassword || userData.password;
  const email = newEmail || userData.email;

  const updateQuery =
    'UPDATE users SET name = $1, email = $2 password = $3 WHERE id = $4';
  const updateRes = await pool.query(updateQuery, [
    name,
    email,
    password,
    userId,
  ]);
  const updatedUser = updateRes.rows[0];

  res
    .status(StatusCodes.OK)
    .json({ msg: 'user updated', data: updatedUser.rows });
}
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

module.exports = {
  register,
  login,
  logout,
  updateUser,
};
