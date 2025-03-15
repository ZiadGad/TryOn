const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, cartController.getLoggedUserCart)
  .post(
    authController.protect,
    // authController.restrictTO('user'),
    cartController.addToCart,
  )
  .delete(
    authController.protect,
    // authController.restrictTO('user'),
    cartController.clearCart,
  );

// router
//   .route('/:id')
//   .get(
//     authController.isLoggedIn,
//     cartController.,
//   )
//   .patch(
//     authController.protect,
//     authController.restrictTO('user'),
//     cartController.,
//   )
router.delete(
  '/:itemId',
  authController.protect,
  // authController.restrictTO('user'),
  cartController.removeSpecificCartItem,
);

module.exports = router;
