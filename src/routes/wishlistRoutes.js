const express = require('express');
const authController = require('../controllers/authController');
const {
  getFavorites,
  addToWishlist,
  removeProductFromWishlist,
} = require('../controllers/whishlistController');
const {
  addToWishlistValidator,
  deleteFromWishlistValidator,
} = require('../utils/validators/wishlistValidator');

const router = express.Router();

router.get('/', authController.isLoggedIn, getFavorites);

router.use(authController.protect, authController.restrictTO('user'));

router.route('/').post(addToWishlistValidator, addToWishlist);
router.delete(
  '/:id',
  authController.protect,
  authController.restrictTO('user'),
  deleteFromWishlistValidator,
  removeProductFromWishlist,
);

module.exports = router;
