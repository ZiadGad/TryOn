const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/apiFeatures');
const { s3Delete } = require('../utils/services/s3Service');
const redisClient = require('../config/redis');

exports.handleHiddenStatus = (req) =>
  !req.user || req.user.role !== 'admin' ? { status: { $ne: 'hide' } } : {};

exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    const filter = this.handleHiddenStatus(req);
    if (req.params.productId) filter.product = req.params.productId;
    if (req.params.categoryId) filter.category = req.params.categoryId;
    if (req.params.subCategoryId)
      filter.subcategories = { $in: [req.params.subCategoryId] };

    if (req.orderFilter) Object.assign(filter, req.orderFilter);

    const documentCounts = await model.countDocuments();

    const features = new ApiFeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .search()
      .paginate(documentCounts);

    const { query, metadata } = features;

    const docs = await query;

    res.status(200).json({
      status: 'success',
      metadata,
      results: docs.length,
      data: docs,
    });
  });

exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const filter = this.handleHiddenStatus(req);
    let query = model.findOne({ _id: req.params.id, ...filter });
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('There is no document with this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (model, cashKey) =>
  catchAsync(async (req, res, next) => {
    if (req.params.categoryId) req.body.category = req.params.categoryId;
    const doc = await model.create(req.body);
    if (cashKey) await redisClient.del(cashKey);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.id);

    if (!doc) return next(new AppError('No document found with that ID', 404));

    if (req.file && doc.image) {
      console.log(doc.image.split('/').slice(-1).toString());
      await s3Delete(doc.image.split('/').slice(-1).toString());
    }

    Object.keys(req.body).forEach((key) => {
      doc[key] = req.body[key];
    });

    await doc.save();

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));

    if (doc.image) await s3Delete(doc.image.split('/').slice(-1).toString());
    await doc.deleteOne();

    res.status(204).json({
      data: null,
    });
  });
