const factory = require('./handleFactory');
const Review = require('../models/reviewsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Product = require('../models/productModel');

exports.setProductUserIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getRatingsBreakdown = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  const reviews = await Review.aggregate([
    {
      $match: { product: product._id },
    },
    {
      $group: {
        _id: { $floor: '$rating' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);
  console.log(`reviews: ${reviews}`);

  const ratingsBreakdown = reviews.map((stat) => ({
    rating: stat._id,
    count: stat.count,
  }));

  console.log(`ratingsBreakdown : ${ratingsBreakdown}`);

  res.status(200).json({
    data: ratingsBreakdown,
  });
});
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
