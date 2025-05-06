const express = require('express');
const authController = require('../controllers/authController');

const { ordersAnalytics } = require('../controllers/dashboardAnalytics');

const router = express.Router();

router.use(authController.protect, authController.restrictTO('admin'));
router.get('/dashboard', ordersAnalytics);

module.exports = router;
