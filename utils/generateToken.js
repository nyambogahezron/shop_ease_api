const jwt = require('jsonwebtoken');

const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict',
  });
  return token;
};

module.exports = generateToken;
