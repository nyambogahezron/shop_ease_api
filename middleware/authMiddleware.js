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
      const userId = decoded.id;
      console.log('userId', userId);

      const query = 'SELECT * FROM users WHERE id = $1';
      const results = await pool.query(query, [decoded.userId]);
      const user = results.rows[0];

      if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
      }

      req.user = { id: user.id, email: user.email, role: user.role };

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };
