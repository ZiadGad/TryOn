const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const productValidator = require('../utils/validators/productValidator');

const router = express.Router({ mergeParams: true });
router.use('/:productId/reviews', reviewRouter);

router.get('/onSaleProducts', productController.getOnSaleProducts);
router.get('/newProducts', productController.getNewProducts);

router
  .route('/')
  .get(authController.isLoggedIn, productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTO('admin'),
    productController.setCategoryId,
    productController.uploadProductImages,
    productValidator.createProductValidator,
    productController.resizeProductImages,
    productController.createProduct,
  );
router
  .route('/:id')
  .get(
    authController.isLoggedIn,
    productValidator.getProductValidator,
    productController.getProduct,
  )
  .patch(
    authController.protect,
    authController.restrictTO('admin'),
    productValidator.updateProductValidator,
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.restrictTO('admin'),
    productValidator.deleteProductValidator,
    productController.deleteProduct,
  );

module.exports = router;
