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

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.owner._id;
  next();
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Owner.findByIdAndUpdate(req.owner.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  await Owner.findByIdAndUpdate(req.owner.id, req.body, { new: true });
  res.status(200).json({
    status: 'Success',
    message: `Owner ${req.owner.id} has been UPDATED successfully`,
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
    openingHours: req.body.openingHours,
    owner: currentOwner.id,
  });
  const currentDate = new Date();
  const datesArray = [currentDate];
  for (let i = 0; i < newPlace.numberOfSeats; i++) {
    const seat = {
      seatNumber: i + 1,
    };
    newPlace.seats.push(seat);
  }

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  if (newPlace.availableFor === 'weekly') {
    for (let i = 1; i < 7; i++) {
      const newDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
      datesArray.push(newDate);
    }

    for (let j = 0; j < newPlace.numberOfSeats; j++) {
      for (const date of datesArray) {
        let activeHours;
        let hours = [];
        switch (date.getDay()) {
          case 0:
            if (newPlace.openingHours[0].closed === false) {
              activeHours =
                newPlace.openingHours[0].closeTime -
                newPlace.openingHours[0].openTime;
            }
            break;
          case 1:
            if (newPlace.openingHours[1].closed === false) {
              activeHours =
                newPlace.openingHours[1].closeTime -
                newPlace.openingHours[1].openTime;
            }
            break;
          case 2:
            if (newPlace.openingHours[2].closed === false) {
              activeHours =
                newPlace.openingHours[2].closeTime -
                newPlace.openingHours[2].openTime;
            }
            break;
          case 3:
            if (newPlace.openingHours[3].closed === false) {
              activeHours =
                newPlace.openingHours[3].closeTime -
                newPlace.openingHours[3].openTime;
            }
            break;
          case 4:
            if (newPlace.openingHours[4].closed === false) {
              activeHours =
                newPlace.openingHours[4].closeTime -
                newPlace.openingHours[4].openTime;
            }
            break;
          case 5:
            if (newPlace.openingHours[5].closed === false) {
              activeHours =
                newPlace.openingHours[5].closeTime -
                newPlace.openingHours[5].openTime;
            }
            break;
          case 6:
            if (newPlace.openingHours[6].closed === false) {
              activeHours =
                newPlace.openingHours[6].closeTime -
                newPlace.openingHours[6].openTime;
            }
            break;
          default:
            console.log('Invalid day');
            break;
        }
        for (let i = 0; i < activeHours; i++) {
          hours.push(false);
        }
        newPlace.seats[j].days.push({ date, hours });
      }
    }
  } else if (newPlace.availableFor === 'monthly') {
    for (let i = 1; i < 30; i++) {
      const newDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
      datesArray.push(newDate);
    }

    for (let j = 0; j < newPlace.numberOfSeats; j++) {
      for (const date of datesArray) {
        let activeHours;
        let hours = [];
        switch (date.getDay()) {
          case 0:
            if (newPlace.openingHours[0].closed === false) {
              activeHours =
                newPlace.openingHours[0].closeTime -
                newPlace.openingHours[0].openTime;
            }
            break;
          case 1:
            if (newPlace.openingHours[1].closed === false) {
              activeHours =
                newPlace.openingHours[1].closeTime -
                newPlace.openingHours[1].openTime;
            }
            break;
          case 2:
            if (newPlace.openingHours[2].closed === false) {
              activeHours =
                newPlace.openingHours[2].closeTime -
                newPlace.openingHours[2].openTime;
            }
            break;
          case 3:
            if (newPlace.openingHours[3].closed === false) {
              activeHours =
                newPlace.openingHours[3].closeTime -
                newPlace.openingHours[3].openTime;
            }
            break;
          case 4:
            if (newPlace.openingHours[4].closed === false) {
              activeHours =
                newPlace.openingHours[4].closeTime -
                newPlace.openingHours[4].openTime;
            }
            break;
          case 5:
            if (newPlace.openingHours[5].closed === false) {
              activeHours =
                newPlace.openingHours[5].closeTime -
                newPlace.openingHours[5].openTime;
            }
            break;
          case 6:
            if (newPlace.openingHours[6].closed === false) {
              activeHours =
                newPlace.openingHours[6].closeTime -
                newPlace.openingHours[6].openTime;
            }
            break;
          default:
            console.log('Invalid day');
            break;
        }
        for (let i = 0; i < activeHours; i++) {
          hours.push(false);
        }
        newPlace.seats[j].days.push({ date, hours });
      }
    }
  }
  await newPlace.save();
  currentOwner.places.push(newPlace);
  await currentOwner.save();
  res.status(200).json({
    status: 'Success',
    massage: `place with name ${newPlace.placeName} added to user ${currentOwner.userName}`,
  });
});

exports.getOwner = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentOwner = await Owner.findById(decoded.id);

  if (!currentOwner) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'Success',
    message: `owner ${req.params.id} has been found successfully`,
    data: currentOwner,
  });
});
exports.createOwner = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.updateOwner = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentOwner = await Owner.findById(decoded.id);

  if (currentOwner.id === req.params.id) {
    const updateOwner = await Owner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 'Success',
      message: `Owner ${req.params.id} has been UPDATED successfully`,
      data: updateOwner,
    });
  } else {
    return next(new AppError('This account does not belong to you', 401));
  }
});

exports.deleteOwner = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentOwner = await Owner.findById(decoded.id);
  if (currentOwner.id === req.params.id) {
    for (var i = 0; i < currentOwner.places.length; i++) {
      await Place.findByIdAndDelete(currentOwner.places[i]);
    }
    const deleteOwner = await Owner.findByIdAndDelete(currentOwner.id);
    res.status(200).json({
      status: 'Success',
      message: `Owner ${req.params.id} has been deleted successfully`,
    });
  } else {
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
