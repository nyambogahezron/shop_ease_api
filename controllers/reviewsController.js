const { pool } = require('../connectDB');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const asyncWrapper = require('../middleware/asyncHandler');

// @desc    Create a review
// @endpoint   POST /api/v1/reviews
// @access  Public

const createReview = asyncWrapper(async (req, res) => {
  const { product_id, comment, rating } = req.body;

  const userId = req.user.id;
  const name = req.user.name;

  if (!product_id || !comment || !rating) {
    throw new CustomError.BadRequestError('All fields are required');
  }

  // check if product exists
  const productQuery = 'SELECT * FROM products WHERE id = $1';
  const productResult = await pool.query(productQuery, [product_id]);
  const product = productResult.rows[0];

  if (!product) {
    throw new CustomError.NotFoundError('Product not found');
  }

  // check if user has already reviewed the product
  const reviewQuery =
    'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2';
  const reviewResult = await pool.query(reviewQuery, [userId, product_id]);

  if (reviewResult.rows[0]) {
    throw new CustomError.BadRequestError(
      'You have already reviewed this product'
    );
  }

  const query =
    'INSERT INTO reviews (name ,rating, comment , user_id, product_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [name, rating, comment, userId, product_id];
  const result = await pool.query(query, values);
  const review = result.rows[0];

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'review added successful', review });
});

// @desc    Get all reviews for a product
// @endpoint   GET /api/v1/products/:product_id/reviews
// @access  Public

const getAllProductsReviews = asyncWrapper(async (req, res) => {
  const { product_id } = req.params;

  const query = 'SELECT * FROM reviews WHERE product_id = $1';
  const result = await pool.query(query, [product_id]);
  const reviews = result.rows;

  if (reviews.length === 0) {
    throw new CustomError.NotFoundError('No reviews found');
  }

  res.status(StatusCodes.OK).json({ reviews });
});

// @desc    Get a single review
// @endpoint   GET /api/v1/reviews/:review_id
// @access  Public

const getSingleReview = asyncWrapper(async (req, res) => {
  const { review_id } = req.params;

  const query = 'SELECT * FROM reviews WHERE id = $1';
  const result = await pool.query(query, [review_id]);
  const review = result.rows[0];

  if (!review) {
    throw new CustomError.NotFoundError('Review not found');
  }

  res.status(StatusCodes.OK).json({ review });
});

// @desc    Update a review
// @endpoint   PATCH /api/v1/reviews/:review_id
// @access  Private
const updateReview = asyncWrapper(async (req, res) => {
  const { review_id } = req.params;
  const { comment, rating } = req.body;

  const userId = req.user.id;

  if (!comment || !rating) {
    throw new CustomError.BadRequestError('All fields are required');
  }

  //check if review exists
  const reviewExistQuery = 'SELECT * FROM reviews WHERE id = $1';
  const reviewExistResult = await pool.query(reviewExistQuery, [review_id]);
  const reviewExist = reviewExistResult.rows[0];

  if (!reviewExist) {
    throw new CustomError.NotFoundError('Review not found');
  }

  //check if its user's review
  const reviewQuery = 'SELECT * FROM reviews WHERE id = $1 AND user_id = $2';
  const reviewResult = await pool.query(reviewQuery, [review_id, userId]);

  const is_userReview = reviewResult.rows[0];

  if (!is_userReview) {
    throw new CustomError.UnauthorizedError(
      'You are not allowed to update this review'
    );
  }

  // create  update review
  const query =
    'UPDATE reviews SET comment = $1, rating = $2 WHERE id = $3 RETURNING *';

  const result = await pool.query(query, [comment, rating, review_id]);

  const review = result.rows[0];

  res.status(StatusCodes.OK).json({ msg: 'review updated successful', review });
});

// @desc    Delete a review
// @endpoint   DELETE /api/v1/reviews/:review_id
// @access  Private
const deleteReview = asyncWrapper(async (req, res) => {
  const { review_id } = req.params;

  const userId = req.user.id;

  //check if review exists
  const reviewExistQuery = 'SELECT * FROM reviews WHERE id = $1';
  const reviewExistResult = await pool.query(reviewExistQuery, [review_id]);
  const reviewExist = reviewExistResult.rows[0];

  if (!reviewExist) {
    throw new CustomError.NotFoundError('Review not found');
  }

  const query =
    'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *';
  const result = await pool.query(query, [review_id, userId]);

  const review = result.rows[0];

  if (!review) {
    throw new CustomError.UnauthorizedError(
      'You are not allowed to delete this review'
    );
  }

  res.status(StatusCodes.OK).json({ msg: 'review deleted successful' });
});

module.exports = {
  createReview,
  getAllProductsReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
