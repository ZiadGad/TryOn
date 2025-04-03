const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Product = require('../../models/productModel');

exports.addToCartValidator = [
  check('productId')
    .notEmpty()
    .withMessage('Enter a Product ID')
    .isMongoId()
    .withMessage('Invalid ID')
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
