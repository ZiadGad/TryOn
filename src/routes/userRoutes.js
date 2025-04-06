const express = require('express');
const authController = require('../controllers/authController');
const {
  getUserValidator,
  changePasswordValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  deleteLoggedUserValidator,
} = require('../utils/validators/userValidator');
const {
  getMe,
  getUser,
  uploadUserImage,
  resizeUserImage,
  updateMe,
  deleteMe,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.route('/me').get(getMe, getUserValidator, getUser);
router.patch(
  '/updateMyPassword',
  changePasswordValidator,
  authController.updatePassword,
);
router.route('/updateMe').patch(uploadUserImage, resizeUserImage, updateMe);
router.route('/deleteMe').delete(getMe, deleteLoggedUserValidator, deleteMe);

router.use(authController.restrictTO('admin'));

router
  .route('/')
  .get(getAllUsers)
  .post(uploadUserImage, createUserValidator, resizeUserImage, createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .patch(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
