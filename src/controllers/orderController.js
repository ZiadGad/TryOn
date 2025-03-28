const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const factory = require('./handleFactory');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createCashOrder = catchAsync(async (req, res, next) => {
  const taxPrice = 0; // App Settings
  const shippingPrice = 0; // App Settings
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) return next(new AppError('No cart with this id', 404));

  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOption, {});

    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({
    status: 'success',
    data: order,
  });
});

exports.filterOrderForLoggedUser = catchAsync(async (req, res, next) => {
  if (req.user && req.user.role === 'user')
    req.orderFilter = { user: req.user._id };
  next();
});

exports.findAllOrders = factory.getAll(Order);

exports.findSpecificOrder = factory.getOne(Order);

exports.updateOrderToPaid = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    return next(new AppError(`No order with this id ${req.params.id}`, 404));

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: updatedOrder,
  });
});

exports.updateOrderToDelivered = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    return next(new AppError(`No order with this id ${req.params.id}`, 404));

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: updatedOrder,
  });
});

exports.checkoutSession = catchAsync(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) return next(new AppError('No cart with this id', 404));

  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          product_data: { name: req.user.name },
          currency: 'egp',
          unit_amount: totalOrderPrice * 100,
        },
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});
