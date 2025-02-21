const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product must have a name'],
      trim: true,
      maxlength: [40, 'A product must have less or equal than 40 characters'],
      minlength: [10, 'A product must have more or equal than 10 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    imgCover: {
      type: String,
      required: [true, 'Product must have an image cover'],
    },
    images: [String],
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
    summary: {
      type: String,
      trim: true,
      required: [true, 'A product must have a summary'],
      minlength: 10,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      minlength: 20,
      maxlength: 1000,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
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
    quantity: {
      type: Number,
      min: 0,
      default: 0,

      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    colors: {
      type: [String],
      required: [true, 'Product must have atleast one color'],
    },
    sizes: {
      type: [String],
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      required: [true, 'Product must have atleast one size'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);
productSchema.index({ category: 1, price: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  } else {
    this.slug = slugify(this.slug, { lower: true });
  }
  next();
});

productSchema.pre('save', function () {
  if (this.isModified('quantity')) this.inStock = this.quantity > 0;
});

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
