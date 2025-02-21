const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getFavorites = catchAsync(async (req, res, next) => {
  if (!req.user)
    return res.status(200).json({ status: 'success', data: { favorites: [] } });

  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    select:
      'name color size ratingsAverage ratingsQuantity price productDiscount imgCover',
  });

  res.status(200).json({
    status: 'success',
    data: {
      favorites: user.favorites,
    },
  });
});

exports.createFavorite = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { favorites: productId },
    },
    { new: true, runValidators: true },
  );
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteFavorite = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { favorites: req.params.id },
    },
    { new: true, runValidators: true },
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
