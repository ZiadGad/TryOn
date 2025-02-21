const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

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
    productController.createProduct,
  );
router
  .route('/:id')
  .get(authController.isLoggedIn, productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTO('admin'),
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.restrictTO('admin'),
    productController.deleteProduct,
  );

module.exports = router;
