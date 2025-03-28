const Category = require('../models/categoryModel');
const factory = require('./handleFactory');

const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

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

  const categories = await query.populate('subCategories');

  res.status(200).json({
    status: 'success',
    metadata,
    results: categories.length,
    data: {
      categories,
    },
  });
});

exports.getCategory = factory.getOne(Category, { path: 'subCategories' });

exports.createCategory = factory.createOne(Category);

exports.updateCategory = factory.updateOne(Category);

exports.deleteCategory = factory.deleteOne(Category);
