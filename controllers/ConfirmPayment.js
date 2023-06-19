const AppError = require('../utils/appError');
const Voucher = require('./../Models/voucher');
const catchAsync = require('./../utils/catchAsync');
const mongoose = require('mongoose');
const https = require('https');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const axios = require('axios');
const Booking = require('../Models/booking');
const Place = require('../Models/place');

const successHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 150px;
        }
        h1 {
            color: #008000;
        }
    </style>
</head>
<body>
    <img src="https://github.com/YoussefAdel15/SpaceZone-BackEnd/blob/Youssef/controllers/success.png?raw=true" alt="Success Icon" width="100">
    <h1>Payment Successful</h1>
    <p>Your payment has been successfully processed.</p>
    <p>Thank you for using SpaceZone!</p>
</body>
</html>
`;

const failHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Failed</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 150px;
        }
        h1 {
            color: #FF0000;
        }
    </style>
</head>
<body>
    <img src="https://raw.githubusercontent.com/YoussefAdel15/SpaceZone-BackEnd/7d1dafab4cd9378e158b8ba2566de5b800f49fbf/controllers/computer-fail.svg" alt="Fail Icon" width="100">
    <h1>Payment Failed</h1>
    <p>Your payment has been declined.</p>
    <p>Please try again.</p>
</body>
</html>
`;

exports.successPayment = catchAsync(async (req, res, next) => {
  const { order } = req.query;
  const voucher = await Voucher.findOne({ orderID: order });
  const booking = await Booking.findOne({ orderID: order });
  if (voucher) {
    voucher.active = true;
    await voucher.save();
  } else if (booking && booking.bookingType === 'sharedAreaSeat') {
    const place = await Place.findById(booking.placeID);
    const date = new Date(booking.bookingDate);
    const startTime = booking.bookingHour;
    const endTime = startTime + booking.bookingHour;
    const availableSeatsIndex = booking.bookingSeats;
    if (availableSeatsIndex.length > 0) {
      // update the seat hours to booked
      for (let i = 0; i < availableSeatsIndex.length; i++) {
        place.seats[availableSeatsIndex[i]].days.forEach((e) => {
          // check if the date is equal to the date he wants to book
          if (
            e.date.toISOString().split('T')[0] ===
            date.toISOString().split('T')[0]
          ) {
            // update the hours to booked from the start time to the end time
            for (let j = startTime; j < endTime; j++) {
              if (e.hours.array[j] === false) {
                e.hours.array[j] = true;
              } else {
                break;
              }
            }
            // mark the document as modified to save the changes
            place.markModified(`seats.${availableSeatsIndex[i]}.days`); // Mark this part of the document as modified
          }
        });
      }
      // save the changes to the database
      await place.save();

      booking.paymentStatus = true;
      await booking.save();
    }
  } else if (booking && booking.bookingType === 'Room') {
    const place = await Place.findById(booking.placeID);
    const room = place.rooms.find((e) => e._id == booking.roomID);
    room.days.forEach((e) => {
      // check if the date is equal to the date he wants to book
      if (
        e.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
      ) {
        // update the hours to booked from the start time to the end time
        for (let j = startTime; j < endTime; j++) {
          if (e.hours.array[j] === false) {
            e.hours.array[j] = true;
          } else {
            break;
          }
        }
        // mark the document as modified to save the changes
        currentPlace.markModified(`rooms.${booking.bookingRoom}.days`); // Mark this part of the document as modified
      }
    });
    // update the seat hours to booked
    // save the changes to the database
    await currentPlace.save();

    booking.paymentStatus = true;
    await booking.save();
  } else if (booking && booking.bookingType === 'silentSeat') {
    // update the seat hours to booked
    for (let i = 0; i < availableSeatsIndex.length; i++) {
      currentPlace.silentSeats[availableSeatsIndex[i]].days.forEach((e) => {
        // check if the date is equal to the date he wants to book
        if (
          e.date.toISOString().split('T')[0] ===
          date.toISOString().split('T')[0]
        ) {
          // update the hours to booked from the start time to the end time
          for (let j = startTime; j < endTime; j++) {
            if (e.hours.array[j] === false) {
              e.hours.array[j] = true;
            } else {
              break;
            }
          }
          // mark the document as modified to save the changes
          currentPlace.markModified(
            `silentSeats.${availableSeatsIndex[i]}.days`
          ); // Mark this part of the document as modified
        }
      });
    }
    // save the changes to the database
    await currentPlace.save();

    booking.paymentStatus = true;
    await booking.save();
  } else {
    res.send(failHTML);
    res.status(400).json({
      status: 'fail',
      message: `No voucher or booking found with this order id: ${order}`,
    });
  }
  res.send(successHTML);

  /////////////////////////////
});
