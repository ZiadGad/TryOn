const mongoose = require('mongoose');
const slugify = require('slugify');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'subCategory must have a name'],
      trim: true,
      lowercase: true,
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    slug: String,
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'subCategory must belong to parent category'],
    },
    image: String,
  },
  { timestamps: true },
);

// Document middleware
subCategorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
    next();
  }
  this.slug = slugify(this.slug, { lower: true });
  next();
});
const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
