const { StatusCodes } = require('http-status-codes');
const { pool } = require('../connectDB');
const CustomError = require('../errors');
const asyncWrapper = require('../middleware/asyncHandler');

// @desc    Create Order
// @endpoint   POST /api/v1/orders
// @access  Public

const createOrder = asyncWrapper(async (req, res) => {
  const userId = 5;
  const paymentIntent = 102;
  const client_secret = 'user_secret';

  const { items: cartItems, tax, shipping_fee } = req.body;

  //check if cartItems is empty
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }

  // check if tax and shipping fee are provided
  if (!tax || !shipping_fee) {
    throw new CustomError.BadRequestError(
      'Please provide tax and shipping fee'
    );
  }

  let orderItems = [];
  let subtotal = 0;

  // check if product exists and calculate subtotal
  for (const item of cartItems) {
    const query = 'SELECT * FROM products WHERE id = $1';
    const values = [item.product];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new CustomError.NotFoundError(
        `No product with id : ${item.product}`
      );
    }

    const dbProduct = result.rows[0];
    const { price } = dbProduct;
    const singleOrderItem = {
      product: item.product,
      amount: item.amount,
      color: item.color,
    };

    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }

  const total = tax + shipping_fee + subtotal;

  // create order
  const orderQuery = `
    INSERT INTO orders (tax, shipping_fee, subtotal, total, user_id,client_secret, payment_intent_id, order_items)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const orderValues = [
    tax,
    shipping_fee,
    subtotal,
    total,
    userId,
    client_secret,
    paymentIntent,
    JSON.stringify(orderItems),
  ];

  const orderResult = await pool.query(orderQuery, orderValues);

  res.status(StatusCodes.CREATED).json({
    order: orderResult.rows[0],
  });
});

// @desc    Get All Order
// @endpoint   GET /api/v1/orders
// @access  Public

const getAllOrders = asyncWrapper(async (req, res) => {
  const query = 'SELECT * FROM orders';
  const result = await pool.query(query);

  res
    .status(StatusCodes.OK)
    .json({ orders: result.rows, count: result.rowCount });
});

// @desc    Get single Order
// @endpoint   GET /api/v1/orders/:id
// @access  Public

const getSingleOrder = asyncWrapper(async (req, res) => {
  const { id: orderId } = req.params;
  const query = 'SELECT * FROM orders WHERE id = $1';
  const values = [orderId];
  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }

  res.status(StatusCodes.OK).json({ order: result.rows[0] });
});

// @desc    Get user Orders
// @endpoint   GET /api/v1/orders/:id
// @access  Public

const getCurrentUserOrders = asyncWrapper(async (req, res) => {
  const { id: userId } = req.params;
  const query = 'SELECT * FROM orders WHERE user_id = $1';
  const values = [userId];
  const result = await pool.query(query, values);

  res
    .status(StatusCodes.OK)
    .json({ orders: result.rows, count: result.rowCount });
});


 // TODO
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const query = 'SELECT * FROM orders WHERE id = $1';
  const values = [orderId];
  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }

  checkPermissions(req.user, result.rows[0].user_id);

  const updateQuery = `
    UPDATE orders
    SET payment_intent_id = $1, status = 'paid'
    WHERE id = $2
    RETURNING *;
  `;
  const updateValues = [paymentIntentId, orderId];
  const updateResult = await pool.query(updateQuery, updateValues);

  res.status(StatusCodes.OK).json({ order: updateResult.rows[0] });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
