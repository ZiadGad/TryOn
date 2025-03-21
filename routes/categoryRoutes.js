const express = require('express');
const productRouter = require('./productRoutes');
const categoryController = require('../controllers/categoryController');
const subCategoryRouter = require('./subCategoryRoutes');
const authController = require('../controllers/authController');
const categoryValidators = require('../utils/validators/categoryValidator');

const router = express.Router();

router.use('/:categoryId/products', productRouter);
router.use('/:categoryId/subcategories', subCategoryRouter);

router
  .route('/')
  .get(authController.isLoggedIn, categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTO('admin'),
    categoryValidators.createCategoryValidator,
    categoryController.createCategory,
  );

router
  .route('/:id')
  .get(
    authController.isLoggedIn,
    categoryValidators.getCategoryValidator,
    categoryController.getCategory,
  )
  .patch(
    authController.protect,
    authController.restrictTO('admin'),
    categoryValidators.updateCategoryValidator,
    categoryController.updateCategory,
  )
  .delete(
    authController.protect,
    authController.restrictTO('admin'),
    categoryValidators.deleteCategoryValidator,
    categoryController.deleteCategory,
  );

module.exports = router;
