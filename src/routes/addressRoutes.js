const express = require('express');
const authController = require('../controllers/authController');
const {
  addAddressValidator,
  deleteAddressValidator,
} = require('../utils/validators/addressValidator');
const {
  addToAddresses,
  getAddresses,
  removeAddress,
} = require('../controllers/addressController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(getAddresses)
  .post(authController.restrictTO('user'), addAddressValidator, addToAddresses);

router.delete(
  '/:addressId',

  authController.restrictTO('user'),
  deleteAddressValidator,
  removeAddress,
);

module.exports = router;
