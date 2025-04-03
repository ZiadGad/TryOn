const express = require('express');
const productRouter = require('./productRoutes');
const authController = require('../controllers/authController');
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  deleteSubCategoryValidator,
  updateSubCategoryValidator,
} = require('../utils/validators/subCategoryValidator');
const {
  getAllSubCategories,
  setCategoryId,
  uploadSubCategoryImage,
  resizeSubCategoryImage,
  createSubCategroy,
  getSubCategory,
  deleteSubCategory,
  updateSubCategory,
} = require('../controllers/subCategoryController');

const router = express.Router({ mergeParams: true });
router.use('/:subCategoryId/products', productRouter);

router.get('/', authController.isLoggedIn, getAllSubCategories);
router.get(
  '/:id',
  authController.isLoggedIn,
  getSubCategoryValidator,
  getSubCategory,
);

router.use(authController.protect, authController.restrictTO('admin'));

router
  .route('/')
  .post(
    setCategoryId,
    uploadSubCategoryImage,
    createSubCategoryValidator,
    resizeSubCategoryImage,
    createSubCategroy,
  );

router
  .route('/:id')
  .patch(
    uploadSubCategoryImage,
    updateSubCategoryValidator,
    resizeSubCategoryImage,
    updateSubCategory,
  )
  .delete(deleteSubCategoryValidator, deleteSubCategory);

module.exports = router;
