const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;

  return totalPrice;
};

exports.getLoggedUserCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  console.log(cart);

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart ? cart.cartItems.length : 0,
    data: cart || [],
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, color, size, quantity } = req.body;

  const product = await Product.findById(productId);

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          size,
          quantity,
          price: product.price,
        },
      ],
    });
  } else {
    const productIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size,
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      cart.cartItems.push({
        product: productId,
        color,
        size,
        quantity,
        price: product.price,
      });
    }
  }

  calcTotalCartPrice(cart);

  await cart.save();
  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    data: cart,
  });
});

exports.removeSpecificCartItem = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true },
  );
  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Item removed From cart successfully',
    data: cart,
  });
});
exports.clearCart = catchAsync(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});
