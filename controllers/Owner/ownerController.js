/* eslint-disable import/no-useless-path-segments */
// eslint-disable-next-line import/order
const mongoose = require('mongoose');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Owner = require('./../../Models/owner');
const authOwner = require('./../Owner/authOwnerController');
const catchAsync = require('./../../utils/catchAsync');
const Place = require('./../../Models/place');
const axios = require('axios');

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
    roomHourPrice: req.body.roomHourPrice,
    numberOfSeats: req.body.numberOfSeats,
    numberOfMeetingRooms: req.body.numberOfMeetingRooms,
    numberOfTrainingRooms: req.body.numberOfTrainingRooms,
    openingHours: req.body.openingHours,
    owner: currentOwner.id,
    numberOfSilentSeats: req.body.numberOfSilentSeats,
    silentSeatPrice: req.body.silentSeatPrice,
    availableFor: req.body.availableFor,
    sharedAreaPhotos: req.body.sharedAreaPhotos,
    silentRoomPhotos: req.body.silentRoomPhotos,
  });
  const MeetingRooms = req.body.MeetingRooms;
  const TrainingRooms = req.body.TrainingRooms;
  const currentDate = new Date();
  const datesArray = [currentDate];
  if (newPlace.numberOfSeats !== 0 && newPlace.hourPrice === null) {
    return next(
      new AppError('Please enter the price of the regular seat', 400)
    );
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
  // GET ACTIVE HOURS FOR EACH DAY
  function getActiveHours(date, openingHours, dayIndex) {
    const dayOpeningHours = openingHours[dayIndex];

    if (dayOpeningHours && !dayOpeningHours.closed) {
      return dayOpeningHours.closeTime - dayOpeningHours.openTime;
    }

    return 0;
  }
  // CREATE N NUMBER OF ELEMENTS INSIDE EACH ARRAY (SEATS , SILENT , ROOMS)
  for (let i = 0; i < newPlace.numberOfSeats; i++) {
    const seat = {
      seatNumber: i + 1,
      silent: false,
    };
    newPlace.seats.push(seat);
  }
  for (let i = 0; i < newPlace.numberOfSilentSeats; i++) {
    const seat = {
      seatNumber: i + 1,
      silent: true,
    };
    newPlace.silentSeats.push(seat);
  }
  for (let i = 0; i < MeetingRooms.length; i++) {
    const meeting = {
      roomNumber: i + 1,
      roomType: 'Meeting Room',
      price: MeetingRooms[i].price,
      seats: MeetingRooms[i].seats,
    };
    newPlace.rooms.push(meeting);
  }
  for (let i = 0; i < TrainingRooms.length; i++) {
    const training = {
      roomNumber: i + 1,
      roomType: 'Training Room',
      price: TrainingRooms[i].price,
      seats: TrainingRooms[i].seats,
    };
    newPlace.rooms.push(training);
  }
  // CHECK IF PLACE IS AVAILABLE FOR WEEKLY OR MONTHLY
  if (newPlace.availableFor === 'weekly') {
    for (let i = 1; i < 7; i++) {
      const newDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
      datesArray.push(newDate);
    }
  } else if (newPlace.availableFor === 'monthly') {
    for (let i = 1; i < 30; i++) {
      const newDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
      datesArray.push(newDate);
    }
  }
  // ADD DAYS TO SEATS
  for (let j = 0; j < newPlace.numberOfSeats; j++) {
    for (const date of datesArray) {
      const activeHours = getActiveHours(
        date,
        newPlace.openingHours,
        date.getDay()
      );

      function Hours() {
        this.array = {};
        this.length = 0;
      }

      Hours.prototype.push = function (index, value) {
        this.array[index] = value;
        this.length++;
      };

      const hours = new Hours();

      for (let i = 0; i < activeHours; i++) {
        hours.push(newPlace.openingHours[date.getDay()].openTime + i, false);
      }

      newPlace.seats[j].days.push({ date, hours });
    }
  }
  // ADD DAYS TO ROOMS
  for (let i = 0; i < newPlace.rooms.length; i++) {
    for (const date of datesArray) {
      const activeHours = getActiveHours(
        date,
        newPlace.openingHours,
        date.getDay()
      );
      function Hours() {
        this.array = {};
        this.length = 0;
      }

      Hours.prototype.push = function (index, value) {
        this.array[index] = value;
        this.length++;
      };

      const hours = new Hours();

      for (let j = 0; j < activeHours; j++) {
        hours.push(newPlace.openingHours[date.getDay()].openTime + j, false);
      }
      newPlace.rooms[i].days.push({ date, hours });
    }
  }
  // ADD DAYS TO SILENT SEATS
  for (let j = 0; j < newPlace.numberOfSilentSeats; j++) {
    for (const date of datesArray) {
      const activeHours = getActiveHours(
        date,
        newPlace.openingHours,
        date.getDay()
      );

      function Hours() {
        this.array = {};
        this.length = 0;
      }

      Hours.prototype.push = function (index, value) {
        this.array[index] = value;
        this.length++;
      };

      const hours = new Hours();

      for (let i = 0; i < activeHours; i++) {
        hours.push(newPlace.openingHours[date.getDay()].openTime + i, false);
      }

      newPlace.silentSeats[j].days.push({ date, hours });
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

exports.resetDays = catchAsync(async (req, res) => {
  const place = await Place.findById(req.params.id);
  const currentDate = new Date();
  const datesArray = [currentDate];
  if (place.availableFor === 'weekly') {
    for (let i = 1; i < 7; i++) {
      const newDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
      datesArray.push(newDate);
    }
  } else if (place.availableFor === 'monthly') {
    for (let i = 1; i < 30; i++) {
      const newDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
      datesArray.push(newDate);
    }
  }
  for (let i = 0; i < place.seats.length; i++) {
    for (let j = 0; j < place.seats[i].days.length; j++) {
      place.seats[i].days[j].date = datesArray[j];
      for (let k = 0; k < place.seats[i].days[j].hours.length; k++) {
        place.seats[i].days[j].hours[k] = false;
      }
    }
    place.markModified(`place.seats[${i}]`); // Mark this part of the document as modified
  }
  for (let i = 0; i < place.silentSeats.length; i++) {
    for (let j = 0; j < place.silentSeats[i].days.length; j++) {
      place.silentSeats[i].days[j].date = datesArray[j];
      for (let k = 0; k < place.silentSeats[i].days[j].hours.length; k++) {
        place.silentSeats[i].days[j].hours[k] = false;
      }
    }
    place.markModified(`place.silentSeats[${i}]`); // Mark this part of the document as modified
  }
  for (let i = 0; i < place.rooms.length; i++) {
    for (let j = 0; j < place.rooms[i].days.length; j++) {
      place.rooms[i].days[j].date = datesArray[j];
      for (let k = 0; k < place.rooms[i].days[j].hours.length; k++) {
        place.rooms[i].days[j].hours[k] = false;
      }
    }
    place.markModified(`place.rooms[${i}]`); // Mark this part of the document as modified
  }
  await place.save();
  res.status(200).json({
    status: 'Success',
    message: `Days for place ${place.placeName} has been reset successfully`,
  });
});

exports.resetDaysForAllPlaces = catchAsync(async (req, res) => {
  const places = await Place.find();
  try {
    for (let i = 0; i < places.length; i++) {
      console.log(places[i].id);
      await axios
        .post(
          `https://spacezone-backend.cyclic.app/api/owner/resetDays/${places[i].id}}`
        )
        .catch((err) => {
          console.log(err);
        });
    }
    res.status(200).json({
      status: 'Success',
      message: `Days for all places has been reset successfully`,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
});
