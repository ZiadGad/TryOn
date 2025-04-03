const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewsModel');
const User = require('../../models/userModel');

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review Id Format'),
  validatorMiddleware,
];

exports.createReviewValidator = [
  body('review').optional(),
  body('rating')
    .notEmpty()
    .withMessage('Enter your rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('rating must be between 1 and 5'),
  body('product')
    .notEmpty()
    .withMessage('review must belong to a product')
    .isMongoId()
    .withMessage('Invalid product id format')
    .custom(async (val, { req }) =>
      Review.findOne({ user: req.user._id, product: req.body.product }).then(
        (review) => {
          if (review)
            return Promise.reject(
              new Error('You already created a review before'),
            );
        },
      ),
    ),
  body('user')
    .notEmpty()
    .withMessage('review must belong to a user')
    .isMongoId()
    .withMessage('Invalid product id format')
    .custom(async (val, { req }) => {
      const user = await User.findById(req.body.user);
      if (!user) throw new Error('No user with this id');
      return true;
    }),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review Id Format')
    .custom((val, { req }) =>
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`There is no review with id ${val}`));
        }

        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`),
          );
        }
      }),
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review Id Format')
    .custom((val, { req }) => {
      if (req.user.role === 'user') {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review with id ${val}`),
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`Your are not allowed to perform this action`),
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
