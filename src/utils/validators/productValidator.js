const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subCategoryModel');

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid Product Id Format'),
  validatorMiddleware,
];

exports.createProductValidator = [
  check('name')
    .notEmpty()
    .withMessage('Product must have a name')
    .isLength({ min: 5 })
    .withMessage('Too short Product name')
    .isLength({ max: 40 })
    .withMessage('Too long Product name'),

  check('summary')
    .notEmpty()
    .withMessage('Product must have a summary')
    .isLength({ min: 10 })
    .withMessage('Summary can not be less than 10 characters')
    .isLength({ max: 200 })
    .withMessage('Summary can not be more than 200 characters'),

  check('description')
    .notEmpty()
    .withMessage('Product must have a description')
    .isLength({ min: 20 })
    .withMessage('Product desciption can not be less than 20 characters')
    .isLength({ max: 1000 })
    .withMessage('Product description can not be more than 1000 characters'),

  check('quantity').notEmpty().withMessage('Product must have a quantity'),

  check('sold').optional().isNumeric().withMessage('Sold must be a number'),

  check('price')
    .notEmpty()
    .withMessage('Product must have a price')
    .isNumeric()
    .withMessage('Price must be a numberic'),

  check('productDiscount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error('Product Discount must be lower then price');
      }
      return true;
    }),

  check('colors')
    .optional()
    .isArray()
    .withMessage('colors should be an array of strings'),

  check('imgCover').optional(),

  check('images')
    .optional()
    .isArray()
    .withMessage('images should be an array of strings'),

  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid Category Id')
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category)
          return Promise.reject(
            new Error(`No Category with this ID ${categoryId}`),
          );
      }),
    ),

  check('subcategories')
    .optional()
    .isMongoId()
    .withMessage('Invalid subcategory Id')
    .custom((subcategoriesId) =>
      SubCategory.find({ _id: { $exists: true, $in: subcategoriesId } }).then(
        (results) => {
          if (results.length < 1 || results.length !== subcategoriesId.length) {
            return Promise.reject(new Error(`Invalid subcategories IDs`));
          }
        },
      ),
    )
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category }).then(
        (subcategories) => {
          let subcategoriesIdsInDB = [];

          subcategoriesIdsInDB = subcategories.map((s) => s._id.toString());
          if (!val.every((v) => subcategoriesIdsInDB.includes(v))) {
            return Promise.reject(
              new Error(`Subcategories are not belong to this category id`),
            );
          }
        },
      ),
    ),

  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('ratingsAverage must be a number'),

  check('ratingsQuantity')
    .optional()
    .isNumeric()
    .withMessage('ratingsQuantity must be a number'),

  validatorMiddleware,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid Product Id Format'),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid Product Id Format'),
  validatorMiddleware,
];
