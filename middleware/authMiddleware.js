const jwt = require('jsonwebtoken');
const asyncWrapper = require('./asyncHandler.js');
const { pool } = require('../connectDB');
const CustomError = require('../errors');

const protect = asyncWrapper(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded.userId;
      console.log(userId.toString() + ' ' + typeof userId);
      const query = 'SELECT * FROM users WHERE id = $1';
      const results = await pool.query(query, [userId]);
      const user = results.rows[0];

      if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      console.error(error);
      throw new CustomError.BadRequestError('Not authorized, token failed');
    }
  } else {
    throw new CustomError.BadRequestError('Not authorized, no token');
  }
});

// admin middleware

const adminProtect = asyncWrapper(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new CustomError.UnauthenticatedError('Not authorized as an admin');
  }
});

module.exports = { protect, adminProtect };
