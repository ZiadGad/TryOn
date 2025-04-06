const express = require('express');
const authController = require('../controllers/authController');
const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviewValidator');
const {
  setProductUserIds,
  createReview,
  updateReview,
  deleteReview,
  getReview,
  getAllReviews,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

// FIXME: Fix Get all reviews route
router.get('/', setProductUserIds, getAllReviews);
router.get('/:id', getReviewValidator, getReview);

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTO('user'),
    setProductUserIds,
    createReviewValidator,
    createReview,
  );
router
  .route('/:id')
  .patch(authController.restrictTO('user'), updateReviewValidator, updateReview)
  .delete(
    authController.restrictTO('user', 'admin'),
    deleteReviewValidator,
    deleteReview,
  );
module.exports = router;
