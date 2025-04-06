const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id Format'),
  validatorMiddleware,
];

exports.createUserValidator = [
  check('name').notEmpty().withMessage('User must have a name'),
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(
      async (val) =>
        await User.findOne({ email: val }).then((user) => {
          if (user) return Promise.reject(new Error('Email already used'));
        }),
    ),
  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 8 })
    .withMessage('Password must be 8 characters'),
  check('passwordConfirm')
    .notEmpty()
    .withMessage('confirm your password')
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  check('photo').optional(),
  check('role')
    .optional()
    .custom((val) => {
      if (!['admin', 'user'].includes(val)) return new Error('Invalid role');
      return true;
    }),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id Format'),
  validatorMiddleware,
];

exports.changePasswordValidator = [
  body('passwordCurrent')
    .notEmpty()
    .withMessage('you must enter current password'),
  body('password').notEmpty().withMessage('you must enter your new password'),
  body('passwordConfirm')
    .notEmpty()
    .withMessage('you must confirm your password')
    .custom((val, { req }) => {
      if (val !== req.body.password)
        throw new Error('Passwords are not the same');
      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id Format'),
  validatorMiddleware,
];

exports.deleteLoggedUserValidator = [
  check('id')
    .notEmpty()
    .withMessage('Provide user ID')
    .isMongoId()
    .withMessage('Invalid MongoId')
    .custom((userId) =>
      User.findById(userId).then((user) => {
        console.log(user.role);
        console.log(user);
        if (user.role === 'admin') {
          return Promise.reject(new Error('Admin Can not delete himself'));
        }
      }),
    ),
  validatorMiddleware,
];
