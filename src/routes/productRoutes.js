const express = require('express');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const {
  deleteProductValidator,
  updateProductValidator,
  getProductValidator,
  createProductValidator,
} = require('../utils/validators/productValidator');
const {
  deleteProduct,
  updateProduct,
  getProduct,
  getOnSaleProducts,
  getNewProducts,
  getAllProducts,
  setCategoryId,
  uploadProductImages,
  resizeProductImages,
  createProduct,
} = require('../controllers/productController');

const router = express.Router({ mergeParams: true });
router.use('/:productId/reviews', reviewRouter);

router.get('/onSaleProducts', authController.isLoggedIn, getOnSaleProducts);
router.get('/newProducts', authController.isLoggedIn, getNewProducts);

router.get('/', authController.isLoggedIn, getAllProducts);
router.get('/:id', authController.isLoggedIn, getProductValidator, getProduct);

router.use(authController.protect, authController.restrictTO('admin'));

router
  .route('/')
  .post(
    setCategoryId,
    uploadProductImages,
    createProductValidator,
    resizeProductImages,
    createProduct,
  );

router
  .route('/:id')
  .patch(
    updateProductValidator,
    uploadProductImages,
    resizeProductImages,
    updateProduct,
  )
  .delete(deleteProductValidator, deleteProduct);

module.exports = router;
