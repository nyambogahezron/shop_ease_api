const router = require('express').Router();

const {
  createReview,
  getAllProductsReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');

router.post('/', createReview);

router.get('/:product_id', getAllProductsReviews);

router
  .route('/item/:review_id')
  .get(getSingleReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
