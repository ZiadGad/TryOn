const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const SubCategory = require('../models/subCategoryModel');
const factory = require('./handleFactory');

exports.setCategoryId = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createSubCategroy = catchAsync(async (req, res, next) => {
  const subCategory = await SubCategory.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      subCategory,
    },
  });
});

exports.getAllSubCategories = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);
  if (req.params.categoryId) filter.category = req.params.categoryId;

  const subCategories = await SubCategory.find(filter);

  res.status(200).json({
    status: 'success',
    results: subCategories.length,
    data: {
      subCategories,
    },
  });
});

exports.getSubCategory = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    ...filter,
  }).populate({
    path: 'category',
    select: 'name -_id',
  });
  if (!subCategory)
    return next(new AppError('No subCategory with this id', 404));

  res.status(200).json({
    status: 'success',
    data: {
      subCategory,
    },
  });
});

exports.updateSubCategory = catchAsync(async (req, res, next) => {
  const freshSubCategory = await SubCategory.findById(req.params.id);
  if (!freshSubCategory)
    return next(new AppError('No subCategory with this id', 404));

  Object.keys(req.body).forEach((key) => {
    freshSubCategory[key] = req.body[key];
  });

  await freshSubCategory.save();

  res.status(200).json({
    status: 'success',
    data: {
      category: freshSubCategory,
    },
  });
});

exports.deleteSubCategory = catchAsync(async (req, res, next) => {
  await SubCategory.findByIdAndDelete(req.params.id);

  res.status(204).json({
    data: null,
  });
});
