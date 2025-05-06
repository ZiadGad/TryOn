const { body, check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.addAddressValidator = [
  body('alias')
    .notEmpty()
    .withMessage('Address must have an alias')
    .isLength({ min: 3 })
    .withMessage('Alias can not be less then 3 characters')
    .isLength({ max: 20 })
    .withMessage('Alias can not be more than 10 caracters'),
  body('phone')
    .notEmpty()
    .withMessage('Address must have a phone number')
    .isMobilePhone('ar-EG')
    .withMessage('Enter an Egyptian valid phone number'),
  body('city').notEmpty().withMessage('Address must have a city'),
  body('details')
    .notEmpty()
    .withMessage('Address must have an address details')
    .isLength({ min: 5 })
    .withMessage('Address details can not be less than 5 characters')
    .isLength({ max: 30 })
    .withMessage('Address details can not be more than 30 characters'),
  validatorMiddleware,
];

exports.deleteAddressValidator = [
  check('addressId')
    .notEmpty()
    .withMessage('Enter address Id')
    .isMongoId()
    .withMessage('Enter a valid mongoID'),
  validatorMiddleware,
];
