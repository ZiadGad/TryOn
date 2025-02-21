// const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Category = require('../models/categoryModel');
const factory = require('./handleFactory');

exports.getAllTopLevelCategories = catchAsync(async (req, res, next) => {
  const topLevelCategories = await Category.find({ isTopLevel: true });

  res.status(200).json({
    status: 'success',
    results: topLevelCategories.length,
    data: {
      categories: topLevelCategories,
    },
  });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isTopLevel: false });

  res.status(200).json({
    status: 'success',
    results: categories.lenght,
    data: {
      categories,
    },
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate({
      path: 'products',
      match: factory.hiddenProductFilter(req),
      select:
        'name imgCover price productDiscount summary ratingsAverage ratingsQuantity inStock',
    })
    .populate({
      path: 'children',
    });
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
  const freshCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

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
