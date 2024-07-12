const router = require('express').Router();

const {
  createReview,
  getAllProductsReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);

router.get('/:product_id', getAllProductsReviews);

router
  .route('/item/:review_id')
  .get(getSingleReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
