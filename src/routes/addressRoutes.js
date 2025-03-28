const express = require('express');

const addressController = require('../controllers/addressController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(addressController.getAddresses)
  .post(authController.restrictTO('user'), addressController.addToAddresses);

router.delete(
  '/:addressId',

  authController.restrictTO('user'),
  addressController.removeAddress,
);

module.exports = router;
