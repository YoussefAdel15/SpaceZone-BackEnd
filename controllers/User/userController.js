/* eslint-disable import/no-useless-path-segments */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../../Models/user');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('../../utils/appError');

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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.deleteUser = catchAsync(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError('User not found', 404));
    }

    if (currentUser._id.toString() !== req.params.id) {
      return next(new AppError('This account does not belong to you', 401));
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
