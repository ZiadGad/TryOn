const Product = require('../models/productModel');
const Review = require('../models/reviewsModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');
const ApiFeatures = require('../utils/apiFeatures');

exports.setCategoryId = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.getNewProducts = catchAsync(async (req, res, next) => {
  const filter = new Date();
  filter.setDate(filter.getDate() - 7);

  const newProducts = await Product.find({
    status: { $ne: 'hide' },
    createdAt: { $gte: filter },
  })
    .sort({ createdAt: -1 })
    .populate({
      path: 'reviews',
    });

  res.status(200).json({
    status: 'success',
    results: newProducts.length,
    data: {
      products: newProducts,
    },
  });
});

exports.getOnSaleProducts = catchAsync(async (req, res, next) => {
  const saleProducts = await Product.aggregate([
    {
      $match: { status: { $ne: 'hide' }, productDiscount: { $gt: 0 } },
    },
    {
      $sort: { productDiscount: -1, createdAt: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: saleProducts.length,
    data: {
      products: saleProducts,
    },
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const filter = factory.hiddenProductFilter(req);

  if (req.params.categoryId) filter.category = req.params.categoryId;

  const features = new ApiFeatures(Product.find(filter), req.query)
    .filter()
    .sort({ createdAt: -1 })
    .limitFields()
    .paginate();

  const products = await features.query.clone();

  const totalItems = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / features.getLimit());

  res.status(200).json({
    status: 'success',
    results: products.length,
    totalItems,
    totalPages,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  let filter = { _id: req.params.id };
  if (!req.user || req.user.role !== 'admin') filter.status = { $ne: 'hide' };

  const product = await Product.findOne(filter).populate({
    path: 'reviews',
  });

  if (!product) {
    return next(new AppError('There is no product with this id', 404));
  }

  const stats = await Review.aggregate([
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

  const ratingsBreakdown = stats.map((stat) => ({
    rating: stat._id,
    count: stat.count,
  }));

  product.ratingsBreakdown = ratingsBreakdown;

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return next(new AppError('There is no product with this id', 400));

  Object.keys(req.body).forEach((key) => {
    product[key] = req.body[key];
  });
  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});
exports.createProduct = factory.createOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
