const express = require('express');
const authController = require('../controllers/authController');

const {
  uploadCouponImage,
  resizeCouponImage,
  createCoupon,
  getCoupon,
  getAllCoupons,
  deleteCoupon,
  updateCoupon,
} = require('../controllers/couponController');

const router = express.Router();

router.use(authController.protect);

router.get('/', getAllCoupons);
router.get('/:id', getCoupon);

router.use(authController.restrictTO('admin'));

router.route('/').post(uploadCouponImage, resizeCouponImage, createCoupon);

router
  .route('/:id')
  .patch(uploadCouponImage, resizeCouponImage, updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
