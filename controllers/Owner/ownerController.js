/* eslint-disable import/no-useless-path-segments */
// eslint-disable-next-line import/order
const mongoose = require('mongoose');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Owner = require('./../../Models/owner');
const authOwner = require('./../Owner/authOwnerController');
const catchAsync = require('./../../utils/catchAsync');
const Place = require('./../../Models/place');

const AppError = require('../../utils/appError');

exports.getAllOwners = catchAsync(async (req, res) => {
  const users = await Owner.find();

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
  await Owner.findByIdAndUpdate(req.owner.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createPlaceForOwner = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentOwner = await Owner.findById(decoded.id);
  const newPlace = new Place({
    placeName: req.body.placeName,
    placePhotos: req.body.placePhotos,
    address: req.body.address,
    zone: req.body.zone,
    number: req.body.number,
    selfService: req.body.selfService,
    googleAddress: req.body.address,
    hourPrice: req.body.hourPrice,
    vipHourPrice: req.body.vipHourPrice,
    roomHourPrice: req.body.roomHourPrice,
    numberOfSeats: req.body.numberOfSeats,
    numberOfRooms: req.body.numberOfRooms,
    openTime: req.body.openAt,
    closeTime: req.body.closeAt,
    owner: currentOwner.id,
  });
  await newPlace.save();
  currentOwner.places.push(newPlace);
  await currentOwner.save();
  res.status(200).json({
    status: 'Success',
    massage: `place with name ${newPlace.placeName} added to user ${currentOwner.userName}`,
  });
});

exports.getOwner = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.createOwner = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.updateOwner = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.deleteOwner = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentOwner = await Owner.findById(decoded.id);
  if (currentOwner.id ===(req.params.id) ) {
   const deleteOwner = await Owner.findByIdAndDelete(currentOwner.id);
   res.status(200).json({
    status: 'Success',
    message:`Owner ${req.params.id} has been deleted succesfully`,
  })
  }
  else {
    return next(new AppError('This account does not belong to you', 401));
  }
});

exports.getPlaces = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentOwner = await Owner.findById(decoded.id);

  const placeDetails = await Place.find({ owner: currentOwner.id });

  res.status(200).json(placeDetails);
});
