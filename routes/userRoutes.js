const router = require('express').Router();

const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updatePassword,
  getCurrentUser,
} = require('../controllers/userController');

router.get('/', getAllUsers);

router.route('/:id').get(getSingleUser).patch(updateUser);


module.exports = router;