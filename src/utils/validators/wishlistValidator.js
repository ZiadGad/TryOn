const { body, check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Product = require('../../models/productModel');

exports.addToWishlistValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Enter a Product Id')
    .isMongoId()
    .withMessage('Invalid MongoID')
    .custom((productId) =>
      Product.findById(productId).then((product) => {
        if (!product) {
          return Promise.reject(
            new Error(`No Product with this ID ${productId}`),
          );
        }
      }),
    ),
  validatorMiddleware,
];

exports.deleteFromWishlistValidator = [
  check('id')
    .notEmpty()
    .withMessage('Enter a Product Id')
    .isMongoId()
    .withMessage('Invalid MongoID'),
  validatorMiddleware,
];
