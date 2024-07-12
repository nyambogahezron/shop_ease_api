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

const { protect, adminProtect } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, adminProtect, createProduct)
  .get(getAllProducts);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch(protect, adminProtect, updateProduct)
  .delete(protect, adminProtect, deleteProduct);

module.exports = router;
