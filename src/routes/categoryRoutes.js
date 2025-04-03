const express = require('express');
const productRouter = require('./productRoutes');
const subCategoryRouter = require('./subCategoryRoutes');
const authController = require('../controllers/authController');
const {
  createCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');
const {
  getAllCategories,
  createCategory,
  getCategory,
  deleteCategory,
  updateCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.use('/:categoryId/products', productRouter);
router.use('/:categoryId/subcategories', subCategoryRouter);

router.get('/', authController.isLoggedIn, getAllCategories);
router.get(
  '/:id',
  authController.isLoggedIn,
  getCategoryValidator,
  getCategory,
);

router.use(authController.protect, authController.restrictTO('admin'));

router.route('/').post(createCategoryValidator, createCategory);
router
  .route('/:id')
  .patch(updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

module.exports = router;
