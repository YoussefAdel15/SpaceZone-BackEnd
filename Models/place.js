/* eslint-disable import/no-useless-path-segments */
/* eslint-disable no-undef */
/* eslint-disable no-multi-assign */
const mongoose = require('mongoose');
const AppError = require('./../utils/appError');

const placeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'owners',
    select: false,
  },
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
  zone: {
    type: String,
    required: [true, 'place must have a zone'],
  },
  number: {
    type: String,
    required: [true, 'place must have a number'],
  },
  selfService: {
    type: Boolean,
    required: [true, 'must specify if the place is self Service or not'],
  },
  googleAddress: {
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
  roomPrice: {
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
  openTime: {
    type: Date,
    //required: [true, 'please enter the starting time of your WorkingSpace'],
  },
  closeTime: {
    type: Date,
    //required: [true, 'Please Enter your closing time'],
  },
  available: {
    type: Boolean,
    default: false,
  },
  feedbacks: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'feedback',
        select: true,
      },
    ],
  },
});

module.exports = place = mongoose.model('place', placeSchema);
