const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Product must have a name'],
      trim: true,
      minlength: [5, 'A product must have more or equal than 5 characters'],
      maxlength: [70, 'A product must have less or equal than 40 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A product must have a summary'],
      minlength: 10,
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
      minlength: 20,
      maxlength: 1000,
    },
    quantity: {
      type: Number,
      required: [true, 'Product Quantity is required'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Product must have a price'],
      min: 0,
    },
    productDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    colors: [String],
    sizes: [String],
    imgCover: {
      type: String,
      required: [true, 'Product must have an image cover'],
      default: 'default.jpeg',
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory',
      },
    ],
    ratingsAverage: {
      type: Number,
      default: 1,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
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
productSchema.index({ category: 1, price: 1 });
productSchema.index({ subcategories: 1 });
productSchema.index({ ratingsAverage: -1, price: 1 });
productSchema.index({ price: 1 });
productSchema.index({ productDiscount: -1, createdAt: -1 });
productSchema.index({ createdAt: -1 });

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('name')) {
    if (!this.slug) {
      this.slug = slugify(this.name, { lower: true });
    } else {
      this.slug = slugify(this.slug, { lower: true });
    }
  }
  next();
});

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
    next();
  }
  this.slug = slugify(this.slug, { lower: true });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
