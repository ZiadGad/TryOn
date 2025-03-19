const express = require('express');

const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post(
  '/:cartId',
  authController.restrictTO('user'),
  orderController.createCashOrder,
);

router.get(
  '/',
  authController.restrictTO('admin', 'user'),
  orderController.filterOrderForLoggedUser,
  orderController.findAllOrders,
);

router.get('/:id', orderController.findSpecificOrder);
module.exports = router;
