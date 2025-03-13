const express = require('express');

const addressController = require('../controllers/addressController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.isLoggedIn, addressController.getAddresses)
  .post(
    authController.protect,
    authController.restrictTO('user'),
    addressController.addToAddresses,
  );

router.delete(
  '/:addressId',
  authController.protect,
  authController.restrictTO('user'),
  addressController.removeAddress,
);

module.exports = router;
