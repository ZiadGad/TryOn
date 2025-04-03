const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Coupon = require('../models/couponModel');
const factory = require('./handleFactory');
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

exports.getAllCoupons = factory.getAll(Coupon);

exports.getCoupon = factory.getOne(Coupon);

exports.createCoupon = factory.createOne(Coupon);

exports.updateCoupon = factory.updateOne(Coupon);

exports.deleteCoupon = factory.deleteOne(Coupon);
