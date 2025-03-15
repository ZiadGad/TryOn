const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Coupon = require('../models/couponModel');
const factory = require('./handleFactory');
const ApiFeatures = require('../utils/apiFeatures');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { s3Upload } = require('../utils/services/s3Service');

exports.uploadCouponImage = uploadSingleImage('image');

exports.resizeCouponImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = await sharp(req.file.buffer)
      .resize(100, 100)
      .toFormat('jpeg')
      .jpeg({ quality: 50 })
      .toBuffer();

    const uploadResult = await s3Upload({
      originalname: `coupon`,
      buffer,
    });

    req.body.image = uploadResult.Location;
    next();
  } catch (err) {
    return next(new AppError(`Error uploading image to S3`, 500));
  }
});

exports.getAllCoupons = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);

  const documentCounts = await Coupon.countDocuments();

  const features = new ApiFeatures(Coupon.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCounts);

  const { query, metadata } = features;

  const coupons = await query;

  res.status(200).json({
    status: 'success',
    metadata,
    results: coupons.length,
    data: {
      coupons,
    },
  });
});

exports.getCoupon = factory.getOne(Coupon);

exports.createCoupon = factory.createOne(Coupon);

exports.updateCoupon = factory.updateOne(Coupon);

exports.deleteCoupon = factory.deleteOne(Coupon);
