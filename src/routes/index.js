const productRouter = require('./productRoutes');
const categoryRouter = require('./categoryRoutes');
const subCategoryRouter = require('./subCategoryRoutes');
const userRouter = require('./userRoutes');
const reviewRouter = require('./reviewRoutes');
const wishlistRouter = require('./wishlistRoutes');
const addressRouter = require('./addressRoutes');
const couponRouter = require('./couponRoutes');
const cartRouter = require('./cartRoutes');
const orderRouter = require('./orderRoutes');
const analyticsRouter = require('./analyticsRoutes');

const mountRoutes = (app) => {
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to TryOn API' });
  });
  app.use('/api/v1/analyticsRouter', analyticsRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/subcategories', subCategoryRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/reviews', reviewRouter);
  app.use('/api/v1/wishlist', wishlistRouter);
  app.use('/api/v1/addresses', addressRouter);
  app.use('/api/v1/coupons', couponRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/orders', orderRouter);
};

module.exports = mountRoutes;
