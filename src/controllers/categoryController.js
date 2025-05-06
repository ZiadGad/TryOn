const Category = require('../models/categoryModel');
const factory = require('./handleFactory');

exports.getAllCategories = factory.getAll(Category);
// exports.getCategory = factory.getOne(Category, { path: 'subCategories' });
exports.getCategory = factory.getOne(Category);
exports.createCategory = factory.createOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);
