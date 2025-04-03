const express = require('express');
const authController = require('../controllers/authController');
const {
  applyCoupon,
  getLoggedUserCart,
  addToCart,
  clearCart,
  updateCart,
  removeSpecificCartItem,
} = require('../controllers/cartController');
const { addToCartValidator } = require('../utils/validators/cartValidator');

const router = express.Router();
router.use(authController.protect, authController.restrictTO('user'));

router.patch('/applyCoupon', applyCoupon);

router
  .route('/')
  .get(getLoggedUserCart)
  .post(addToCartValidator, addToCart)
  .delete(clearCart);

router.route('/:itemId').patch(updateCart).delete(removeSpecificCartItem);

module.exports = router;
