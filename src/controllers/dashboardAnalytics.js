const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');

exports.ordersAnalytics = catchAsync(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // بداية يوم اليوم

  const totalOrders = await Order.countDocuments();

  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: today },
  });

  const allTimeSalesAgg = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  const allTimeSales = allTimeSalesAgg[0]?.total || 0;

  const ordersDelivered = await Order.countDocuments({ isDelivered: true });

  res.status(200).json({
    totalOrders,
    todayOrders,
    allTimeSales,
    ordersDelivered,
  });
});
