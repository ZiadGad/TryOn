const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category must have a name'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    slug: String,
    description: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 100,
    },
    // image: {
    //   type: String,
    //   default: '/default-category.png',
    // },
    status: {
      type: String,
      enum: ['show', 'hide'],
      default: 'show',
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
categorySchema.index({ name: 1 });

// FIXME: Change ref to subcategory

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

// Query middleware

// Document middleware
categorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
    next();
  }
  this.slug = slugify(this.slug, { lower: true });
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
