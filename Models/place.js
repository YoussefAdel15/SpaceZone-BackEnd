const mongoose = require('mongoose');
const AppError = require('./../utils/appError');

const daysSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  hours: {
    type: {
      [Number]: Boolean,
    },
  },
  // if false then the seat is available
});

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: Number,
    required: true,
  },
  days: [daysSchema],
});
const roomSchema = new mongoose.Schema({
  roomType: {
    type: String,
    enum: ['Meeting Room', 'Training Room'],
    required: true,
  },
  roomNumber: {
    type: Number,
    required: true,
  },
  days: [daysSchema],
  roomPhotos: {
    type: [
      {
        type: String,
      },
    ],
    required: [true, 'Room Must Have Photos'],
  },
  price: {
    type: Number,
  },
  seats: {
    type: Number,
  },
  description: {
    type: String,
  },
});

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
  numberOfMeetingRooms: {
    type: Number,
  },
  numberOfTrainingRooms: { type: Number },
  numberOfSilentSeats: { type: Number },
  silentSeatPrice: { type: Number },
  numberOfSeats: {
    type: Number,
    required: [true, 'Please Enter number of Seats in your WorkingSpace'],
  },
  seats: [seatSchema],
  silentSeats: [seatSchema],
  availableFor: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'weekly',
  },
  rooms: [roomSchema],
  openingHours: {
    type: [
      {
        /*Days are (
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday')*/
        day: { type: String, required: true },
        openTime: { type: Number },
        closeTime: { type: Number },
        closed: { type: Boolean, default: false },
      },
    ],
    required: true,
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
  products: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'products',
        select: true,
      },
    ],
  },
  offers: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'offers',
        select: true,
      },
    ],
  },
  bio: {
    type: String,
    default: '',
  },
  rules: {
    type: [{ type: String }],
    default: [],
  },
  amenities: {
    type: [{ type: String }], // enums,
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
  silentRoomPhotos: {
    type: [
      {
        type: String,
      },
    ],
  },
  sharedAreaPhotos: {
    type: [
      {
        type: String,
      },
    ],
  },
});

module.exports = place = mongoose.model('place', placeSchema);
