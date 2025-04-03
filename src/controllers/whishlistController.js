const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const redisClient = require('../config/redis');

exports.getFavorites = catchAsync(async (req, res, next) => {
  if (!req.user)
    return res.status(200).json({
      status: 'success',
      message: 'No user Empty Whishlist',
      data: { wishlist: [] },
    });

  const cachedKey = `wishlist:${req.user._id}`;
  const cachedData = await redisClient.get(cachedKey);
  if (cachedData) {
    return res.status(200).json({
      status: 'success',
      cached: true,
      results: JSON.parse(cachedData).length,
      data: {
        categories: JSON.parse(cachedData),
      },
    });
  }

  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select:
      'name color size ratingsAverage ratingsQuantity price productDiscount imgCover',
  });

  await redisClient.set(cachedKey, JSON.stringify(user.wishlist));

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: {
      wishlist: user.wishlist,
    },
  });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const cachedKey = `wishlist:${req.user._id}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true, runValidators: true },
  );

  await redisClient.del(cachedKey);

  res.status(200).json({
    status: 'success',
    message: 'Product added succefully to your wishlist',
    data: user.wishlist,
  });
});

exports.removeProductFromWishlist = catchAsync(async (req, res, next) => {
  const cachedKey = `wishlist:${req.user._id}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.id },
    },
    { new: true },
  );

  await redisClient.del(cachedKey);

  res.status(200).json({
    status: 'success',
    message: 'Product removed succefully from your wishlist',
    data: user.wishlist,
  });
});
