const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getFavorites = catchAsync(async (req, res, next) => {
  if (!req.user)
    return res.status(200).json({ status: 'success', data: { wishlist: [] } });

  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select:
      'name color size ratingsAverage ratingsQuantity price productDiscount imgCover',
  });

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: {
      wishlist: user.wishlist,
    },
  });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true, runValidators: true },
  );
  res.status(200).json({
    status: 'success',
    message: 'Product added succefully to your wishlist',
    data: user.wishlist,
  });
});

exports.removeProductFromWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.id },
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    message: 'Product removed succefully from your wishlist',
    data: user.wishlist,
  });
});
