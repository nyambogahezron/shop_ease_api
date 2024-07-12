const express = require('express');
const router = express.Router();

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers/ordersController.js');

const { protect } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, createOrder).get(getAllOrders);

router.get('/user', protect, getCurrentUserOrders);

router.route('/:id').get(getSingleOrder).patch(protect, updateOrder);

module.exports = router;
