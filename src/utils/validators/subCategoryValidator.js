const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid SubCategory Id Format'),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('SubCategory must have a name')
    .isLength({ min: 3 })
    .withMessage('Too short Subcategory name')
    .isLength({ max: 32 })
    .withMessage('Too long Subcategory name'),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid SubCategory Id Format'),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid SubCategory Id Format'),
  validatorMiddleware,
];
