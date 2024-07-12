const router = require('express').Router();

const {
  register,
  login,
  logoutUser,
} = require('../controllers/authController.js');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logoutUser);

module.exports = router;
