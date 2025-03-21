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
    status: {
      type: String,
      enum: ['show', 'hide'],
      default: 'show',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);
categorySchema.index({ createdAt: -1 });
categorySchema.index({ name: 1 });

categorySchema.virtual('subCategories', {
  ref: 'SubCategory',
  foreignField: 'category',
  localField: '_id',
});

categorySchema.virtual('products', {
  ref: 'Product',
  foreignField: 'category',
  localField: '_id',
});

categorySchema.pre(/^find/, function (next) {
  this.populate({ path: 'subCategories', select: 'name' });
  next();
});

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
