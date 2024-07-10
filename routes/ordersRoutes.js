const express = require('express');
const router = express.Router();

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers/ordersController.js');

router.route('/').post(createOrder).get(getAllOrders);

router.get('/user/:id', getCurrentUserOrders);

router.route('/:id').get(getSingleOrder).patch(updateOrder);

module.exports = router;
