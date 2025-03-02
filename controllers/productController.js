const multer = require('multer');

const Product = require('../models/productModel');
const Review = require('../models/reviewsModel');
const Variant = require('../models/variantModel');
const factory = require('./handleFactory');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const client = require('../utils/redisClient');

const { uploadImageJob } = require('../queues/jobs/ImageJobs');

exports.setCategoryId = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/products');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImages = upload.fields([
  { name: 'imgCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

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

  const cachProducts = await client.get('products');
  if (cachProducts != null) {
    console.log('cach hit');
    return res.status(200).json({
      status: 'success',
      results: JSON.parse(cachProducts).length,
      data: {
        products: JSON.parse(cachProducts),
      },
    });
  }
  console.log('cach miss');
  const features = new ApiFeatures(Product.find(filter), req.query)
    .filter()
    .sort({ createdAt: -1 })
    .limitFields()
    .paginate();

  const products = await features.query;
  client.set('products', JSON.stringify(products));
  return res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  // const filter = { _id: req.params.id };
  // if (!req.user || req.user.role !== 'admin') filter.status = { $ne: 'hide' };
  const filter = factory.hiddenProductFilter(req);
  filter._id = req.params.id;

  const product = await Product.findOne(filter)
    .populate({
      path: 'reviews',
    })
    .populate({
      path: 'variations',
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
  let variants;
  const product = await Product.create(req.body);
  if (req.files && (req.files.imgCover || req.files.images)) {
    const imgCover = req.files.imgCover ? req.files.imgCover[0].path : null;
    const images = req.files.images
      ? req.files.images.map((file) => file.path)
      : [];
    uploadImageJob(product._id, imgCover, images);
  }

  if (req.body.variants) {
    req.body.variants = JSON.parse(req.body.variants);
    const handleVariants = req.body.variants.map((variant) => ({
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...variant,
      product: req.product._id,
    }));
    variants = await Variant.insertMany(handleVariants);
  }
  res.status(201).json({
    status: 'success',
    data: {
      product,
      variants: variants || [],
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return next(new AppError('There is no product with this id', 404));

  if (req.files && (req.files.imgCover || req.files.images)) {
    const imgCover = req.files.imgCover ? req.files.imgCover[0].path : null;
    const images = req.files.images
      ? req.files.images.map((file) => file.path)
      : [];
    uploadImageJob(product._id, imgCover, images);
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

exports.deleteProduct = factory.deleteOne(Product);
