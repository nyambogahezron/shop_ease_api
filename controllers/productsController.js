const path = require('path');
const { StatusCodes } = require('http-status-codes');
const { pool } = require('../connectDB');
const CustomError = require('../errors');
const asyncWrapper = require('../middleware/asyncHandler');

// @desc   create a product
// @endpoint   POST /api/v1/auth/products
// @access  Private/Admin

const createProduct = asyncWrapper(async (req, res) => {
  const {
    name,
    price,
    discount,
    description,
    image,
    category,
    company,
    colors,
    featured,
    freeShipping,
    inventory,
    averageRating,
    numOfReviews,
  } = req.body;

  const query = `
    INSERT INTO products (name, price, discount, description, image, category, company, colors, featured, freeShipping, inventory, averageRating, numOfReviews)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;
  const values = [
    name,
    price,
    discount,
    description,
    image,
    category,
    company,
    colors,
    featured,
    freeShipping,
    inventory,
    averageRating,
    numOfReviews,
  ];

  const result = await pool.query(query, values);
  const product = result.rows[0];
  res.status(StatusCodes.CREATED).json({ product });
});

// @desc   get all products
// @endpoint   GET /api/v1/auth/products
// @access  Public

const getAllProducts = asyncWrapper(async (req, res) => {
  const result = await pool.query('SELECT * FROM products');
  res
    .status(StatusCodes.OK)
    .json({ products: result.rows, count: result.rowCount });
});

// @desc   get single product
// @endpoint   GET /api/v1/auth/products/:id
// @access  Public

const getSingleProduct = asyncWrapper(async (req, res) => {
  const { id: productId } = req.params;
  const query = 'SELECT * FROM products WHERE id = $1';
  const values = [productId];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product: result.rows[0] });
});

// @desc   update product
// @endpoint   PATCH /api/v1/auth/products/:id
// @access  Private/Admin

const updateProduct = asyncWrapper(async (req, res) => {
  const { id: productId } = req.params;
  const {
    name,
    price,
    discount,
    description,
    image,
    category,
    company,
    colors,
    featured,
    freeShipping,
    inventory,
    averageRating,
    numOfReviews,
  } = req.body;

  const query = `
    UPDATE products
    SET name = $1, price = $2, discount = $3, description = $4, image = $5, category = $6, company = $7, colors = $8, featured = $9, freeShipping = $10, inventory = $11, averageRating = $12, numOfReviews = $13, updated_at = CURRENT_TIMESTAMP
    WHERE id = $14
    RETURNING *;
  `;
  const values = [
    name,
    price,
    discount,
    description,
    image,
    category,
    company,
    colors,
    featured,
    freeShipping,
    inventory,
    averageRating,
    numOfReviews,
    productId,
  ];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Product updated successfully', product: result.rows[0] });
});

// @desc   delete product
// @endpoint   DELETE /api/v1/auth/products/:id
// @access  Private/Admin

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
  const values = [productId];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

// TODO: Add uploadImage function

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No File Uploaded');
  }
  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image');
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      'Please upload image smaller than 1MB'
    );
  }

  const imagePath = path.join(
    __dirname,
    '../public/uploads/' + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
