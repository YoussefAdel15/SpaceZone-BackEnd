const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');

const ContactUs = require('../../Models/contactUs');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.sendContactUs = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const contactUsForm = await ContactUs.create({
    Name: req.body.Name,
    Email: req.body.Email,
    Phone: req.body.Phone,
    Message: req.body.Message,
  });
  res.status(200).json({
    status: 'success',
    message: 'contactUs Form Sent Successful, We Will Contact You Shortly',
  });
});

exports.getContactUs = catchAsync(async (req, res, next) => {
  const Forms = await ContactUs.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: Forms.length,
    data: {
      Forms,
    },
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Getting the token and check if it' there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //console.log(token);

  if (!token) {
    next(new AppError('You are not logged in, please login'), 401);
  }

  // 2) Validate the token (Verification)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The User belonging to this token is no longer exist.', 401)
    );
  }

  // 4) Check if user changed password after the Token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please login again', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  console.log(req.user);
  next();
  return currentUser;
});
