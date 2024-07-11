const router = require('express').Router();

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');

router.post('/', createReview);

router.get('/:product_id', getAllReviews);

router
  .route('/item/:review_id')
  .get(getSingleReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
