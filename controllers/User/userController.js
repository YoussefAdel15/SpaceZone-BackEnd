/* eslint-disable import/no-useless-path-segments */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../../Models/user');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Booking = require('./../../Models/booking');
const Feedback = require('./../../Models/feedback');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
  res.status(200).json({
    status: 'Success',
    message: `User ${req.owner.id} has been UPDATED successfully`,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  if (!currentUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'Success',
    message: `User ${req.params.id} has been found successfully`,
    currentUser,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (currentUser.id === req.params.id) {
    const currentUserUpdated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({
      status: 'Success',
      message: `User ${req.params.id} has been UPDATED successfully`,
      data: currentUserUpdated,
    });
  } else {
    return next(new AppError('This account does not belong to you', 401));
  }
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError('User not found', 404));
    }

    await User.findByIdAndDelete(currentUser._id);

    res.status(200).json({
      status: 'Success',
      message: `User ${req.params.id} has been deleted successfully`,
    });
  } catch (err) {
    return next(err);
  }
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ userID: req.user.id });

  res.status(200).json({
    status: 'Success',
    message: `User Bookings has been found successfully`,
    bookings,
  });
});

exports.getUserFeedbacks = catchAsync(async (req, res, next) => {
  const feedbacks = await Feedback.find({ userID: req.user.id });

  res.status(200).json({
    status: 'Success',
    message: `User Feedbacks has been found successfully`,
    feedbacks,
  });
});
