const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const GlobalErrorHandler = require('./controllers/errorController');
const userRoute = require('./Routes/userRoutes');
const xss = require('xss-clean');
const AppError = require('./utils/AppError');
const hpp = require('hpp');
const viewRouter = require('./Routes/viewRoute');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// ******************************************************************************* //

// Morgen is logging MIDDLEWARE that log the HTTP request
if (process.env.NODE_ENV === 'development') {
  //(dev) is a predefined log format
  app.use(morgan('dev'));
}
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // Replace with client's origin
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
// ******************************************************************************* //

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection like $ or . malicious characters
app.use(mongoSanitize());

// ******************************************************************************* //

// Data sanitization of user input against XSS
//This function removes or escapes malicious code
app.use('/', viewRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/users', userRoute);
app.use(xss());

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(GlobalErrorHandler);
module.exports = app;
