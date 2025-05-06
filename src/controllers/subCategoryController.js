const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const SubCategory = require('../models/subCategoryModel');
const factory = require('./handleFactory');
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
      .resize(407, 611)
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

exports.getAllSubCategories = factory.getAll(SubCategory);
exports.getSubCategory = factory.getOne(SubCategory, {
  path: 'category',
  select: 'name -_id',
});
exports.createSubCategroy = factory.createOne(SubCategory);
exports.updateSubCategory = factory.updateOne(SubCategory);
exports.deleteSubCategory = factory.deleteOne(SubCategory);
