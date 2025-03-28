const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const userValidator = require('../utils/validators/userValidator');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router
  .route('/me')
  .get(
    userController.getMe,
    userValidator.getUserValidator,
    userController.getUser,
  );

router.patch(
  '/updateMyPassword',
  userValidator.changePasswordValidator,
  authController.updatePassword,
);

router
  .route('/updateMe')
  .patch(
    userController.uploadUserImage,
    userController.resizeUserImage,
    userController.updateMe,
  );
router.route('/deleteMe').delete(userController.deleteMe);

router.use(authController.restrictTO('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(
    userController.uploadUserImage,
    userValidator.createUserValidator,
    userController.resizeUserImage,
    userController.createUser,
  );

router
  .route('/:id')
  .get(userValidator.getUserValidator, userController.getUser)
  .patch(userValidator.updateUserValidator, userController.updateUser)
  .delete(userValidator.deleteUserValidator, userController.deleteUser);

module.exports = router;
