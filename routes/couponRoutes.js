const express = require('express');

const couponController = require('../controllers/couponController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(couponController.getAllCoupons)
  .post(
    authController.restrictTO('admin'),
    couponController.uploadCouponImage,
    couponController.resizeCouponImage,
    couponController.createCoupon,
  );

router
  .route('/:id')
  .get(couponController.getCoupon)
  .patch(
    authController.restrictTO('admin'),
    couponController.uploadCouponImage,
    couponController.resizeCouponImage,
    couponController.updateCoupon,
  )
  .delete(authController.restrictTO('admin'), couponController.deleteCoupon);

module.exports = router;
