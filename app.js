const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');

const mountRoutes = require('./routes');
// const productRouter = require('./routes/productRoutes');
// const categoryRouter = require('./routes/categoryRoutes');
// const subCategoryRouter = require('./routes/subCategoryRoutes');
// const userRouter = require('./routes/userRoutes');
// const reviewRouter = require('./routes/reviewRoutes');
// const wishlistRouter = require('./routes/wishlistRoutes');
// const addressRouter = require('./routes/addressRoutes');
// const couponRouter = require('./routes/couponRoutes');
// const cartRouter = require('./routes/cartRoutes');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cors());
app.options('*', cors());
app.enable('trust proxy');
app.use(compression());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

const apiLimiter = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes!',
});

const loginLimiter = rateLimit({
  max: 20,
  windowMs: 15 * 60 * 1000,
  message:
    'Too many login attempts from this IP, please try again after 15 minutes!',
});

app.use('/api', apiLimiter);
app.use('/api/v1/users/login', loginLimiter);

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'price',
      'quantity',
      'sold',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  }),
);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser Middlewares
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(cookieParser());

mountRoutes(app);
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to TryOn API' });
// });
// app.use('/api/v1/categories', categoryRouter);
// app.use('/api/v1/subcategories', subCategoryRouter);
// app.use('/api/v1/products', productRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/wishlist', wishlistRouter);
// app.use('/api/v1/addresses', addressRouter);
// app.use('/api/v1/coupons', couponRouter);
// app.use('/api/v1/cart', cartRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} in this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
