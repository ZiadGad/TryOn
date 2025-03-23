const express = require('express');

const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get(
  '/checkout-session/:cartId',
  authController.restrictTO('user'),
  orderController.checkoutSession,
);
router.get(
  '/',
  authController.restrictTO('admin', 'user'),
  orderController.filterOrderForLoggedUser,
  orderController.findAllOrders,
);

router.post(
  '/:cartId',
  authController.restrictTO('user'),
  orderController.createCashOrder,
);

router.get('/:id', orderController.findSpecificOrder);

router.patch(
  '/:id/pay',
  authController.restrictTO('admin'),
  orderController.updateOrderToPaid,
);
router.patch(
  '/:id/deliver',
  authController.restrictTO('admin'),
  orderController.updateOrderToDelivered,
);
module.exports = router;
