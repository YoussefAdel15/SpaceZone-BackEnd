const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  placeID: {
    type: mongoose.Schema.ObjectId,
    ref: 'places',
    select: true,
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    select: true,
  },
  placeName: {
    type: String,
    required: true,
  },
  priceToPay: {
    type: Number,
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  bookingHour: {
    type: Number,
    required: true,
  },
  bookingRoom: {
    type: Number,
    required: false,
  },
  bookingSeat: {
    type: Number,
    required: false,
  },
  bookingStatus: {
    type: Boolean,
    required: true,
  },
  paymentStatus: {
    type: Boolean,
    default: false,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  productID: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'products',
        select: true,
      },
    ],
  },
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: false,
  },
});
module.exports = booking = mongoose.model('booking', bookingSchema);
