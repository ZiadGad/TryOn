// const sharp = require('sharp');
// const AppError = require('../utils/AppError');
const Category = require('../models/categoryModel');
const factory = require('./handleFactory');
// const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
// const { s3Upload } = require('../utils/services/s3Service');

const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

// exports.uploadCategoryImage = uploadSingleImage('image');

// exports.resizeCategoryImage = catchAsync(async (req, res, next) => {
//   if (!req.file) return next();

//   try {
//     const buffer = await sharp(req.file.buffer)
//       .resize(400, 400)
//       .toFormat('jpeg')
//       .jpeg({ quality: 65 })
//       .toBuffer();

//     const uploadResult = await s3Upload({
//       originalname: `category`,
//       buffer,
//     });

//     req.body.image = uploadResult.Location;
//     next();
//   } catch (err) {
//     return next(new AppError(`Error uploading image to S3`, 500));
//   }
// });

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);

  const documentCounts = await Category.countDocuments();

  const features = new ApiFeatures(Category.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCounts);

  const { query, metadata } = features;

  const categories = await query;

  res.status(200).json({
    status: 'success',
    metadata,
    results: categories.length,
    data: {
      categories,
    },
  });
});

exports.getCategory = factory.getOne(Category);

exports.createCategory = factory.createOne(Category);

exports.updateCategory = factory.updateOne(Category);

exports.deleteCategory = factory.deleteOne(Category);

// exports.updateCategory = catchAsync(async (req, res, next) => {
//   const freshCategory = await Category.findById(req.params.id);
//   if (!freshCategory)
//     return next(new AppError('No category with this id', 404));

//   if (req.file && freshCategory.image) {
//     await s3Delete(freshCategory.image.split('/').slice(-1).toString());
//   }

//   Object.keys(req.body).forEach((key) => {
//     freshCategory[key] = req.body[key];
//   });

//   await freshCategory.save();

//   res.status(200).json({
//     status: 'success',
//     data: {
//       category: freshCategory,
//     },
//   });
// });

// exports.getCategory = catchAsync(async (req, res, next) => {
//   const filter = factory.handleHiddenStatus(req);
//   const category = await Category.findOne({ _id: req.params.id, ...filter });
//   if (!category) return next(new AppError('No category with this id', 404));

//   res.status(200).json({
//     status: 'success',
//     data: {
//       category,
//     },
//   });
// });
