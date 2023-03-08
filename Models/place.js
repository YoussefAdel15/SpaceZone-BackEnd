/* eslint-disable import/no-useless-path-segments */
/* eslint-disable no-undef */
/* eslint-disable no-multi-assign */
const mongoose = require('mongoose');
const AppError = require('./../utils/appError');

const placeSchema = new mongoose.Schema({
  placeName: {
    type: String,
    required: [true, 'WorkingSpace Must Have A Name'],
  },
  placePhotos: {
    type: [
      {
        type: String,
      },
    ],
    required: [true, 'WorkingSpace Must Have Photos'],
  },
  address: {
    type: String,
    required: [true, 'Please enter your WorkingSpace address'],
  },
  googleAddres: {
    type: String,
    required: [
      true,
      'Please enter your WorkingSpace address link from Google Maps',
    ],
  },
  hourPrice: {
    type: Number,
    required: [true, 'Please enter your 1 Hour price for regular seats'],
  },
  vipHourPrice: {
    type: Number,
  },
  numberOfSeats: {
    type: Number,
    required: [true, 'Please Enter number of Seats in your WorkingSpace'],
  },
  numberOfRooms: {
    type: Number,
  },
  //   products:{
  //     type
  //   },
  openAt: {
    type: Date,
    required: [true, 'please enter the starting time of your WorkingSpace'],
  },
  closeAt: {
    type: Date,
    required: [true, 'Please Enter your closing time'],
  },
  available: {
    type: Boolean,
    default: false,
  },
});

module.exports = place = mongoose.model('place', placeSchema);
