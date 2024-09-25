const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRouter');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serveing static files
app.use(express.static(path.join(__dirname, 'public')));
// Set Secuirty HTTP Headers
// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [
//         "'self'",
//         'https://cdnjs.cloudflare.com',
//         'https://api.mapbox.com',
//         'https://js.stripe.com',
//       ],
//       scriptSrc: ["'self'", 'https://js.stripe.com'], // Allow Stripe scripts
//       frameSrc: ["'self'", 'https://js.stripe.com'], // Allow Stripe frames
//       connectSrc: ["'self'", 'https://api.stripe.com'], // Allow Stripe API requests
//       imgSrc: ["'self'", 'https://*.stripe.com'], // Allow Stripe images
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       workerSrc: ["'self'", 'blob:'],
//       connectSrc: ["'self'", 'https://api.mapbox.com'],
//     },
//   }),
// );

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent paramter pollution
app.use(
  hpp({
    whitelist: [
      'ratingAverage',
      'ratingQuantity',
      'duration',
      'maxGroupSize',
      'price',
    ],
  }),
);

app.use(compression());

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} in this Server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
