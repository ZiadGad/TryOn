const express = require('express');
const reviewController = require('../controllers/reviewController');
const reviewValidator = require('../utils/validators/reviewValidator');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTO('user'),
    reviewController.setProductUserIds,
    reviewValidator.createReviewValidator,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewValidator.getReviewValidator, reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTO('user'),
    reviewValidator.updateReviewValidator,
    reviewController.updateReview,
  )
  .delete(
    authController.protect,
    authController.restrictTO('user', 'admin'),
    reviewValidator.deleteReviewValidator,
    reviewController.deleteReview,
  );
module.exports = router;
