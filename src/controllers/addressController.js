const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const redisClient = require('../config/redis');

exports.getAddresses = catchAsync(async (req, res, next) => {
  const cachedKey = `addresses:${req.user._id}`;

  const cachedData = await redisClient.get(cachedKey);
  if (cachedData) {
    return res.status(200).json({
      status: 'success',
      results: JSON.parse(cachedData).length,
      data: JSON.parse(cachedData),
    });
  }

  const user = await User.findById(req.user._id);

  await redisClient.set(cachedKey, JSON.stringify(user.addresses));

  res.status(200).json({
    status: 'success',
    results: user.addresses.length,
    data: user.addresses,
  });
});

exports.addToAddresses = catchAsync(async (req, res, next) => {
  const cachedKey = `addresses:${req.user._id}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true },
  );

  await redisClient.del(cachedKey);
  res.status(200).json({
    status: 'success',
    message: 'Address added successfully',
    data: user.addresses,
  });
});

exports.removeAddress = catchAsync(async (req, res, next) => {
  const cachedKey = `addresses:${req.user._id}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true },
  );
  await redisClient.del(cachedKey);

  res.status(200).json({
    status: 'success',
    message: 'Address removed succefully',
    data: user.addresses,
  });
});
