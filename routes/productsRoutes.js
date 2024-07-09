const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require('../controllers/productsController');


router.route('/').post(createProduct).get(getAllProducts);

router.route('/:id').get(getSingleProduct).patch(updateProduct).delete(deleteProduct);


module.exports = router;
