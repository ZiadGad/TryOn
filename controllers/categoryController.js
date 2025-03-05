// const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Category = require('../models/categoryModel');
const factory = require('./handleFactory');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);
  const categories = await Category.find(filter);

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const filter = factory.handleHiddenStatus(req);
  const category = await Category.findOne({ _id: req.params.id, ...filter });
  if (!category) return next(new AppError('No category with this id', 404));

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      category: newCategory,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const freshCategory = await Category.findById(req.params.id);
  if (!freshCategory)
    return next(new AppError('No category with this id', 404));

  Object.keys(req.body).forEach((key) => {
    freshCategory[key] = req.body[key];
  });

  await freshCategory.save();

  res.status(200).json({
    status: 'success',
    data: {
      category: freshCategory,
    },
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  await Category.findByIdAndDelete(req.params.id);

  res.status(204).json({
    data: null,
  });
});
