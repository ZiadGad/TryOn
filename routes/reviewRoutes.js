const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTO('user'),
    reviewController.setProductUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTO('user'),
    reviewController.updateReview,
  )
  .delete(
    authController.protect,
    authController.restrictTO('user', 'admin'),
    reviewController.deleteReview,
  );
module.exports = router;
