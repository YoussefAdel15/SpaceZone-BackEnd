/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-useless-path-segments */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Place = require('./../../Models/place');
const catchAsync = require('./../../utils/catchAsync');
const Owner = require('./../../Models/owner');
const AppError = require('../../utils/appError');
const place = require('./../../Models/place');

exports.getAllPlaces = catchAsync(async (req, res, next) => {
  const places = await Place.find();

  res.status(200).json({
    status: 'success',
    results: places.length,
    data: {
      places,
    },
  });
});

exports.editThisPlace = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentOwner = await Owner.findById(decoded.id);
  // eslint-disable-next-line prefer-destructuring
  const places = currentOwner.places;
  const reqID = mongoose.Types.ObjectId(req.params.id);
  const DoesBelong = await places.find((place) => place._id.equals(reqID));
  if (!DoesBelong) {
    return next(new AppError('This Place Does not Belong to you', 401));
  }

  const newPlace = await Place.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({
    status: 'Success',
    massage: `place ${req.params.id} has been updated succesfully`,
  });
});
