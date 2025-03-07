const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const SubCategory = require('../models/subCategoryModel');
const factory = require('./handleFactory');
const ApiFeatures = require('../utils/apiFeatures');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { s3Upload } = require('../utils/services/s3Service');

exports.setCategoryId = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.uploadSubCategoryImage = uploadSingleImage('image');

exports.resizeSubCategoryImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = await sharp(req.file.buffer)
      .resize(400, 400)
      .toFormat('jpeg')
      .jpeg({ quality: 65 })
      .toBuffer();

    const uploadResult = await s3Upload({
      originalname: `subcategory`,
      buffer,
    });

    req.body.image = uploadResult.Location;
    next();
  } catch (err) {
    return next(new AppError(`Error uploading image to S3`, 500));
  }
});

exports.getAllSubCategories = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);
  if (req.params.categoryId) filter.category = req.params.categoryId;

  const documentCounts = await SubCategory.countDocuments();

  const features = new ApiFeatures(SubCategory.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCounts);

  const { query, metadata } = features;

  const subCategories = await query;

  res.status(200).json({
    status: 'success',
    metadata,
    results: subCategories.length,
    data: {
      subCategories,
    },
  });
});

exports.getSubCategory = factory.getOne(SubCategory, {
  path: 'category',
  select: 'name -_id',
});

exports.createSubCategroy = factory.createOne(SubCategory);

exports.updateSubCategory = factory.updateOne(SubCategory);

exports.deleteSubCategory = factory.deleteOne(SubCategory);

// exports.updateSubCategory = catchAsync(async (req, res, next) => {
//   const freshSubCategory = await SubCategory.findById(req.params.id);
//   if (!freshSubCategory)
//     return next(new AppError('No subCategory with this id', 404));

//   Object.keys(req.body).forEach((key) => {
//     freshSubCategory[key] = req.body[key];
//   });

//   await freshSubCategory.save();

//   res.status(200).json({
//     status: 'success',
//     data: {
//       category: freshSubCategory,
//     },
//   });
// });

// exports.getSubCategory = catchAsync(async (req, res, next) => {
//   const filter = factory.handleHiddenStatus(req);
//   const subCategory = await SubCategory.findOne({
//     _id: req.params.id,
//     ...filter,
//   }).populate({
//     path: 'category',
//     select: 'name -_id',
//   });
//   if (!subCategory)
//     return next(new AppError('No subCategory with this id', 404));

//   res.status(200).json({
//     status: 'success',
//     data: {
//       subCategory,
//     },
//   });
// });
