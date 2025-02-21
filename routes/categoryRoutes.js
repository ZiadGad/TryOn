const express = require('express');
const productRouter = require('./productRoutes');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use('/:categoryId/products', productRouter);

router.get('/top-level', categoryController.getAllTopLevelCategories);

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTO('admin'),
    categoryController.createCategory,
  );

router
  .route('/:id')
  .get(authController.isLoggedIn, categoryController.getCategory)
  .patch(
    authController.protect,
    authController.restrictTO('admin'),
    categoryController.updateCategory,
  )
  .delete(
    authController.protect,
    authController.restrictTO('admin'),
    categoryController.deleteCategory,
  );

module.exports = router;
