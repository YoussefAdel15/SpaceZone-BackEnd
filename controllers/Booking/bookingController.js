const mongoose = require('mongoose');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');

const Place = require('../../Models/place');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.checkAvailability = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  let date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  const numberOfSeats = req.body.numberOfSeats;
  let availableHoursIndexGlobal = [];
  date = date.toISOString().split('T')[0];
  let availableSeatsIndex = [];
  let availableSeats = 0;
  function hasConsecutiveNumbers(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }
  if (startTime < endTime) {
    for (let i = 0; i < currentPlace.numberOfSeats; i++) {
      for (let j = 0; j < currentPlace.seats[i].days.length; j++) {
        if (
          currentPlace.seats[i].days[j].date.toISOString().split('T')[0] ===
          date
        ) {
          if (currentPlace.seats[i].days[j].hours.length === 0) {
            res.status(200).json({
              status: 'fail',
              message: 'Place is not available',
            });
          }
          if (availableSeats === numberOfSeats) {
            break;
          } else if (availableSeats < numberOfSeats) {
            let availableHours = 0;
            let availableHoursIndex = [];
            for (let k = startTime; k < endTime; k++) {
              if (
                currentPlace.seats[i].days[j].hours.array[k] == false &&
                availableHours < numberOfHours
              ) {
                availableHours++;
                availableHoursIndex.push(k);
              }
              if (
                availableHours === numberOfHours &&
                availableSeats < numberOfSeats
              ) {
                if (hasConsecutiveNumbers(availableHoursIndex)) {
                  availableSeats++;
                  availableSeatsIndex.push(i);
                  break;
                }
              }
            }
          }
        }
      }
    }
  } else {
    res.status(200).json({
      status: 'fail',
      message: 'Invalid time',
    });
  }
  if (availableSeats < numberOfSeats && availableSeatsIndex.length > 0) {
    res.status(200).json({
      status: 'fail',
      message: `No available seats at the moment, available seats numbers is ${availableSeatsIndex.length}`,
    });
  }
  if (availableSeats === numberOfSeats && availableSeatsIndex.length > 0) {
    res.status(200).json({
      status: 'success',
      availableSeatsIndex,
    });
  }
});
