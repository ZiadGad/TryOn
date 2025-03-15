const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'Coupon must have a name'],
    },
    code: {
      type: String,
      trim: true,
      required: [true, 'coupon must have a code'],
      unique: true,
      uppercase: true,
    },
    expire: {
      type: Date,
      required: [true, 'coupon must have expire date'],
    },
    discount: {
      type: Number,
      required: [true, 'coupon must have a discount value'],
    },
    image: String,
  },
  { timestamps: true },
);
couponSchema.index({ expire: 1 }, { expireAfterSeconds: 0 });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
