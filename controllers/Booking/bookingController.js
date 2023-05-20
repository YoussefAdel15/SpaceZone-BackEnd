const mongoose = require('mongoose');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');

const Place = require('../../Models/place');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.checkAvailabilitySeats = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  let date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  const numberOfSeats = req.body.numberOfSeats;
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
          // check if the date is equal to the date he wants
          currentPlace.seats[i].days[j].date.toISOString().split('T')[0] ===
          date
        ) {
          if (currentPlace.seats[i].days[j].hours.length === 0) {
            // working space is off
            res.status(200).json({
              status: 'fail',
              message: 'Place is not available',
            });
            break;
          }
          if (availableSeats === numberOfSeats) {
            // he checked all the seats and found the number of seats he wants so he breaks the loop and return the available seats
            break;
          } else if (availableSeats < numberOfSeats) {
            let availableHours = 0;
            let availableHoursIndex = [];
            for (let k = startTime; k < endTime; k++) {
              if (
                currentPlace.seats[i].days[j].hours.array[k] == false &&
                availableHours < numberOfHours
              ) {
                // check if the seat is available and if the number of hours is less than the number of hours he wants
                // add the hour to the available hours array and increment the available hours
                availableHours++;
                availableHoursIndex.push(k);
              }
              if (
                availableHours === numberOfHours &&
                availableSeats < numberOfSeats
              ) {
                // check if the number of hours is equal to the number of hours he wants and if the number of seats is less than the number of seats he wants
                // check if the hours are consecutive
                if (hasConsecutiveNumbers(availableHoursIndex)) {
                  // if the hours are consecutive then increment the available seats and add the seat index to the available seats array and break the loop
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
}); //DONE

exports.checkAvailabilitySilentSeats = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  let date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  const numberOfSeats = req.body.numberOfSeats;
  date = date.toISOString().split('T')[0];
  let availableSeatsIndex = [];
  let availableSeats = 0;
  // console.log(currentPlace.silentSeats[0].days);
  function hasConsecutiveNumbers(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }
  console.log(Array.isArray(currentPlace.silentSeats[0].days));
  if (startTime < endTime) {
    for (let i = 0; i < currentPlace.numberOfSeats; i++) {
      // check if the silent seat is not null and if the silent seat has days and if the days is an array
      if (
        currentPlace.silentSeats &&
        currentPlace.silentSeats[i] &&
        currentPlace.silentSeats[i].days &&
        Array.isArray(currentPlace.silentSeats[i].days)
      ) {
        for (let j = 0; j < currentPlace.silentSeats[i].days.length; j++) {
          if (
            // check if the date is equal to the date he wants
            currentPlace.silentSeats[i].days[j].date
              .toISOString()
              .split('T')[0] === date
          ) {
            if (currentPlace.silentSeats[i].days[j].hours.length === 0) {
              // working space is off
              res.status(200).json({
                status: 'fail',
                message: 'Place is not available',
              });
              break;
            }
            if (availableSeats === numberOfSeats) {
              // he checked all the seats and found the number of seats he wants so he breaks the loop and return the available seats
              break;
            } else if (availableSeats < numberOfSeats) {
              let availableHours = 0;
              let availableHoursIndex = [];
              for (let k = startTime; k < endTime; k++) {
                if (
                  currentPlace.silentSeats[i].days[j].hours.array[k] == false &&
                  availableHours < numberOfHours
                ) {
                  // check if the seat is available and if the number of hours is less than the number of hours he wants
                  // add the hour to the available hours array and increment the available hours
                  availableHours++;
                  availableHoursIndex.push(k);
                }
                if (
                  availableHours === numberOfHours &&
                  availableSeats < numberOfSeats
                ) {
                  // check if the number of hours is equal to the number of hours he wants and if the number of seats is less than the number of seats he wants
                  // check if the hours are consecutive
                  if (hasConsecutiveNumbers(availableHoursIndex)) {
                    // if the hours are consecutive then increment the available seats and add the seat index to the available seats array and break the loop
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
}); //DONE

exports.checkAvailabilityRooms = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.pid);
  const room = currentPlace.rooms.find((e) => e._id == req.params.rid);
  let date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  date = date.toISOString().split('T')[0];
  let done = false;
  function hasConsecutiveNumbers(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }
  if (startTime < endTime) {
    for (let j = 0; j < room.days.length; j++) {
      if (
        // check if the date is equal to the date he wants
        room.days[j].date.toISOString().split('T')[0] === date
      ) {
        if (room.days[j].hours.length === 0) {
          // working space is off
          done = true;
          res.status(200).json({
            status: 'fail',
            message: 'Place is not available',
          });

          break;
        }
        let availableHours = 0;
        let availableHoursIndex = [];
        for (let k = startTime; k < endTime; k++) {
          if (
            room.days[j].hours.array[k] == false &&
            availableHours < numberOfHours
          ) {
            // check if the seat is available and if the number of hours is less than the number of hours he wants
            // add the hour to the available hours array and increment the available hours
            availableHours++;
            availableHoursIndex.push(k);
          }
          if (availableHours === numberOfHours) {
            // check if the number of hours is equal to the number of hours he wants and if the number of seats is less
            // than the number of seats he wants
            // check if the hours are consecutive
            if (hasConsecutiveNumbers(availableHoursIndex)) {
              // if the hours are consecutive then increment the available seats and add the seat index to the available seats array and break the loop
              break;
            }
          } else {
            done = true;
            res.status(200).json({
              status: 'fail',
              message: `Room is Not available at the moment`,
            });
            break;
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
  if (done === false) {
    res.status(200).json({
      status: 'success',
      message: `Room number ${room.roomNumber} is available from ${
        startTime > 12 ? startTime - 12 : startTime + 12
      } ${startTime > 12 ? 'PM' : 'AM'} to ${
        endTime > 12 ? endTime - 12 : endTime + 12
      } ${endTime > 12 ? 'PM' : 'AM'}`,
    });
  }
}); //DONE

