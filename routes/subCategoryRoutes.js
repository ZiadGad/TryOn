const express = require('express');
const productRouter = require('./productRoutes');
const subCategoryController = require('../controllers/subCategoryController');
const authController = require('../controllers/authController');
const subCategoryValidators = require('../utils/validators/subCategoryValidator');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.isLoggedIn, subCategoryController.getAllSubCategories)
  .post(
    authController.protect,
    authController.restrictTO('admin'),
    subCategoryController.setCategoryId,
    subCategoryValidators.createSubCategoryValidator,
    subCategoryController.createSubCategroy,
  );

router
  .route('/:id')
  .get(
    authController.isLoggedIn,
    subCategoryValidators.getSubCategoryValidator,
    subCategoryController.getSubCategory,
  )
  .patch(
    authController.protect,
    authController.restrictTO('admin'),
    subCategoryValidators.updateSubCategoryValidator,
    subCategoryController.updateSubCategory,
  )
  .delete(
    authController.protect,
    authController.restrictTO('admin'),
    subCategoryValidators.deleteSubCategoryValidator,
    subCategoryController.deleteSubCategory,
  );

module.exports = router;
