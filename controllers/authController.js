const bcrypt = require('bcrypt');
const { pool } = require('../connectDB');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const asyncWrapper = require('../middleware/asyncHandler');
const jwt = require('jsonwebtoken');

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
  const userId = user.id;

  // Generate token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict',
  });

  res.status(StatusCodes.CREATED).json({ user, token });
});


// @desc    Login user & get token
// @endpoint   POST /api/v1/auth/login
// @access  Public
const login = asyncWrapper( async (req, res) => {
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
    throw new CustomError.BadRequestError('Invalid credentials');
  }

  const userId = user.id;

  // Generate token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict',
  });

  res.status(StatusCodes.OK).json({ msg:"logged in successful",user, token });
});



// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ msg: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  logoutUser,
};
