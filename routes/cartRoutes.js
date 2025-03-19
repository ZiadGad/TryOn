const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();
router.patch(
  '/applyCoupon',
  authController.protect,
  authController.restrictTO('user'),
  cartController.applyCoupon,
);

router
  .route('/')
  .get(authController.protect, cartController.getLoggedUserCart)
  .post(
    authController.protect,
    authController.restrictTO('user'),
    cartController.addToCart,
  )
  .delete(
    authController.protect,
    authController.restrictTO('user'),
    cartController.clearCart,
  );

router
  .route('/:itemId')
  .patch(
    authController.protect,
    authController.restrictTO('user'),
    cartController.updateCart,
  )
  .delete(
    authController.protect,
    authController.restrictTO('user'),
    cartController.removeSpecificCartItem,
  );

module.exports = router;
