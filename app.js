/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);

  next();
});

app.enable('trust proxy');

app.use(
  cors({
    origin: [
      '*',
      'http://*',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:8000',
    ],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

// APIs

app.use('/api/user', require('./routes/user-routes'));
app.use('/api/owner', require('./routes/owner-routes'));
app.use('/api/places', require('./routes/places-routes'));

app.use(globalErrorHandler);

module.exports = app;
