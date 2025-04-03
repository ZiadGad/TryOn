const express = require('express');
const authController = require('../controllers/authController');

const {
  checkoutSession,
  filterOrderForLoggedUser,
  findAllOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
  findSpecificOrder,
  createCashOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.use(authController.protect);

router.get(
  '/checkout-session/:cartId',
  authController.restrictTO('user'),
  checkoutSession,
);
router.get(
  '/',
  authController.restrictTO('admin', 'user'),
  filterOrderForLoggedUser,
  findAllOrders,
);

router.post('/:cartId', authController.restrictTO('user'), createCashOrder);

router.get('/:id', findSpecificOrder);

router.patch('/:id/pay', authController.restrictTO('admin'), updateOrderToPaid);
router.patch(
  '/:id/deliver',
  authController.restrictTO('admin'),
  updateOrderToDelivered,
);
module.exports = router;
