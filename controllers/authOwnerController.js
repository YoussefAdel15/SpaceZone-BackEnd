/* eslint-disable import/no-useless-path-segments */
const Owner = require('../Models/owner');
// eslint-disable-next-line import/order
const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { check, validationResult } = require('express-validator');
// eslint-disable-next-line import/order
const jwt = require('jsonwebtoken');
const sendEmail = require('./../utils/email');

exports.SignupOwner = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newOwner = await Owner.create({
    userName: req.body.userName,
    number: req.body.number,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });

  const token = jwt.sign({ id: newOwner._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newOwner,
    },
  });
});

exports.loginOwner = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide Email & Password!', 400));
  }
  // 2) check if the user exist && password is correct
  const owner = await Owner.findOne({ email: email }).select('+password');

  if (!owner || !(await owner.correctPassword(password, owner.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) if everything ok, send token to client

  const token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  console.log(token);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// //Forget Password
// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on posted email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError('There is no user with this email address', 404));
//   }

//   // 2) Generate the random reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   // 3) send it to user's email
//   const resetURL = `${req.protocol}://${req.get(
//     'host'
//   )}/api/user/resetPasswordUser/${resetToken}`;

//   const html = `  <head>
//   <meta charset="utf-8">
//   <title>Reset Password</title>
// </head>
// <body>
//   <h1>Reset Your Password</h1>
//   <p>Hello,${user.userName}</p>
//   <p>You are receiving this email because you requested a password reset for your account.</p>
//   <p>Please click on the link below to reset your password:</p>
//   <a href="${resetURL}">${resetURL}</a>
//   <p>If you did not request a password reset, please ignore this message.</p>
//   <p>Thank you!</p>
// </body>`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Your password reset token (valid for 10mins)',
//       html,
//     });
//     res.status(200).json({
//       status: 'success',
//       massage: 'Token sent to email!',
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError('There wase an error sending the mail. Try again later', 500)
//     );
//   }
// });

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   //  1) get user based on the token
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() }, // see if the token expired
//   });

//   // 2) if token has not expired, and there is user, set the new password
//   if (!user) {
//     return next(new AppError('Token is invalid or has expired', 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirmation = req.body.passwordConfirmation;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();

//   // 3) update changePasswordAt property for the user
//   // 4) Log the user in, send JWT
//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
//   //console.log(token);
//   res.status(200).json({
//     status: 'success',
//     token,
//   });
// });
