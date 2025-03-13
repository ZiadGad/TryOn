const express = require('express');

const wishlistController = require('../controllers/whishlistController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.isLoggedIn, wishlistController.getFavorites)
  .post(
    authController.protect,
    authController.restrictTO('user'),
    wishlistController.addToWishlist,
  );

router.delete(
  '/:id',
  authController.protect,
  authController.restrictTO('user'),
  wishlistController.removeProductFromWishlist,
);

module.exports = router;
