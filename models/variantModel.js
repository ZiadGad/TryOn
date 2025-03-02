const mongoose = require('mongoose');

const variantSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Variation must have a product'],
  },
  sku: {
    type: String,
  },
  color: {
    type: String,
    required: [true, 'Variation must have a color'],
    uppercase: true,
  },
  size: {
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL'],
    required: [true, 'Variation must have a size'],
    uppercase: true,
  },
  quantity: {
    type: Number,
    min: 0,
    default: 0,
  },
  inStock: {
    type: Boolean,
    default: function () {
      return this.quantity > 0;
    },
  },
});

variantSchema.index({ product: 1, color: 1, size: 1 }, { unique: true });

const Variant = mongoose.model('Variant', variantSchema);

module.exports = Variant;
