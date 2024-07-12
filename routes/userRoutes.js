const router = require('express').Router();

const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updatePassword,
  getCurrentUser,
} = require('../controllers/userController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, adminProtect, getAllUsers)
  .patch(protect, updateUser);

router.route('/:id').get(protect, getSingleUser);

router.patch('/update-password/:id', protect, updatePassword);

router.get('/user', protect, getCurrentUser);

module.exports = router;
