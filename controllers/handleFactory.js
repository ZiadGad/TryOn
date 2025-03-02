const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/apiFeatures');

exports.hiddenProductFilter = (req) =>
  !req.user || req.user.role !== 'admin' ? { status: { $ne: 'hide' } } : {};

exports.getAll = (model, sort) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };
    const features = new ApiFeatures(model.find(filter), req.query)
      .filter()
      .sort(sort)
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });

exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('There is no document with this id', 400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 400));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No document found with that ID', 400));
    res.status(200).json({
      status: 'success',
      data: {
        user: doc,
      },
    });
  });
