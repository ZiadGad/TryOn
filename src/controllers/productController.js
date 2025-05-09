const sharp = require('sharp');
const Product = require('../models/productModel');
const Review = require('../models/reviewsModel');
const factory = require('./handleFactory');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  uploadMultipleImages,
} = require('../middlewares/uploadImageMiddleware');
const { s3Upload, s3Delete } = require('../utils/services/s3Service');

exports.setCategoryId = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.uploadProductImages = uploadMultipleImages([
  { name: 'imgCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files.imgCover || (!req.files.imgCover && !req.files.images))
    return next();
  try {
    if (req.files.imgCover) {
      const buffer = await sharp(req.files.imgCover[0].buffer)
        .resize(407, 611)
        .toFormat('jpeg')
        .jpeg({ quality: 97 })
        .toBuffer();

      const uploadResult = await s3Upload({
        originalname: `cover`,
        buffer,
      });

      req.body.imgCover = uploadResult.Location;
    }

    if (req.files.images) {
      const imageUploadPromises = req.files.images.map(async (img, idx) => {
        const imgBuffer = await sharp(img.buffer)
          .resize(407, 611)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toBuffer();

        const uploadResult = await s3Upload({
          originalname: `${idx + 1}`,
          buffer: imgBuffer,
        });

        return uploadResult.Location;
      });

      req.body.images = await Promise.all(imageUploadPromises);
    }
    next();
  } catch (err) {
    console.log(`(S3) Error In Uploading Images: ${err}`);
    return next(new AppError(`Error uploading image to S3`, 500));
  }
});

exports.getNewProducts = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);

  const features = new ApiFeatures(
    Product.find(filter).sort('-createdAt').limit(40),
    req.query,
  )
    .filter()
    .limitFields()
    .search();

  const { query } = features;

  const newProducts = await query;

  res.status(200).json({
    status: 'success',
    results: newProducts.length,
    data: {
      products: newProducts,
    },
  });
});

exports.getOnSaleProducts = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);
  filter.productDiscount = { $gt: 0 };
  const documentCounts = await Product.countDocuments();
  req.query.sort = '-productDiscount,-createdAt';

  const features = new ApiFeatures(Product.find(filter), req.query)
    .sort()
    .search()
    .paginate(documentCounts);

  const { query, metadata } = features;

  const saleProducts = await query;

  res.status(200).json({
    status: 'success',
    metadata,
    results: saleProducts.length,
    data: {
      products: saleProducts,
    },
  });
});

exports.getAllProducts = factory.getAll(Product);
exports.createProduct = factory.createOne(Product);

exports.getProduct = catchAsync(async (req, res, next) => {
  let wishlist = [];
  if (req.user) {
    wishlist = req.user.wishlist;
  }
  const filter = factory.handleHiddenStatus(req);
  filter._id = req.params.id;

  const product = await Product.findOne(filter)
    .populate({
      path: 'category',
      select: 'name',
    })
    .populate({
      path: 'subcategories',
      select: 'name',
    })
    .populate({
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

  res.status(200).json({
    status: 'success',
    data: {
      product,
      ratingsBreakdown,
      wishlist,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return next(new AppError('There is no product with this id', 404));

  if (req.files && (req.files.imgCover || req.files.images)) {
    const deleteCover = product.imgCover
      ? [s3Delete(product.imgCover.split('/').slice(-1).toString())]
      : [];

    const deleteImages = product.images
      ? product.images.map((image) =>
          s3Delete(image.split('/').slice(-1).toString()),
        )
      : [];

    await Promise.all([...deleteCover, ...deleteImages]);
  }

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

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('No product with this id', 404));

  const deleteOperations = [];

  if (product.imgCover) {
    const coverKey = product.imgCover.split('/').slice(-1).toString();
    deleteOperations.push(s3Delete(coverKey));
  }

  if (product.images) {
    product.images.forEach((image) => {
      const imageKey = image.split('/').slice(-1).toString();
      deleteOperations.push(s3Delete(imageKey));
    });
  }

  await Promise.all(deleteOperations);

  await product.deleteOne();

  res.status(204).json({
    data: null,
  });
});
