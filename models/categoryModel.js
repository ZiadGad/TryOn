const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Category must have a name'],
      // unique: true,
      lowercase: true,
    },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 100,
    },
    image: {
      type: String,
      default: '/default-category.png',
    },

    isTopLevel: {
      type: Boolean,
      default: function () {
        return this.parent === null;
      },
    },
    status: {
      type: String,
      enum: ['show', 'hide'],
      default: 'show',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
categorySchema.index({ isTopLevel: 1, name: 1 });
categorySchema.index({ parent: 1, name: 1 }, { unique: true });

categorySchema.virtual('children', {
  ref: 'Category',
  foreignField: 'parent',
  localField: '_id',
});

categorySchema.virtual('products', {
  ref: 'Product',
  foreignField: 'category',
  localField: '_id',
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
