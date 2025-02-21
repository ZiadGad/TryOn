const express = require('express');

const favoriteController = require('../controllers/favoriteController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.isLoggedIn, favoriteController.getFavorites)
  .post(
    authController.protect,
    authController.restrictTO('user'),
    favoriteController.createFavorite,
  );

router.delete(
  '/:id',
  authController.protect,
  authController.restrictTO('user'),
  favoriteController.deleteFavorite,
);

module.exports = router;
