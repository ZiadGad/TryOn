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
  if (req.files.imgCover) {
    const buffer = await sharp(req.files.imgCover[0].buffer)
      .resize(350, 350)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
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
        .resize(350, 350)
        .toFormat('jpeg')
        .jpeg({ quality: 70 })
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
});

exports.getNewProducts = catchAsync(async (req, res, next) => {
  const date = new Date();
  date.setDate(date.getDate() - 20);

  const filter = factory.handleHiddenStatus(req);
  filter.createdAt = { $gte: date };

  const documentCounts = await Product.countDocuments();

  const features = new ApiFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCounts);

  const { query, metadata } = features;

  const newProducts = await query.populate({
    path: 'reviews',
  });

  res.status(200).json({
    status: 'success',
    results: newProducts.length,
    metadata,
    data: {
      products: newProducts,
    },
  });
});

exports.getOnSaleProducts = catchAsync(async (req, res, next) => {
  const documentCounts = await Product.countDocuments();

  const features = new ApiFeatures(
    Product.aggregate([
      {
        $match: { status: { $ne: 'hide' }, productDiscount: { $gt: 0 } },
      },
      {
        $sort: { productDiscount: -1, createdAt: -1 },
      },
    ]),
    req.query,
  )
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

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);

  if (req.params.categoryId) filter.category = req.params.categoryId;
  const documentCounts = await Product.countDocuments();

  const features = new ApiFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCounts);

  const { query, metadata } = features;

  const products = await query;
  return res.status(200).json({
    status: 'success',
    metadata,
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);
  filter._id = req.params.id;

  const product = await Product.findOne(filter)
    .populate({
      path: 'reviews',
    })
    .populate({
      path: 'category',
      select: 'name -_id',
    })
    .populate({
      path: 'subcategories',
      select: 'name -_id',
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

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      product,
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
