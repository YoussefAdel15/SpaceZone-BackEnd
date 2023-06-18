const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  placeID: { // place that user booked
    type: mongoose.Schema.ObjectId,
    ref: 'places',
    select: true,
  },
  userID: { // user who booked
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    select: true,
  },
  placeName: { // name of place
    type: String,
    required: true,
  },
  priceToPay: { // price of booking
    type: Number,
    required: true,
  },
  bookingDate: { // date of booking
    type: Date,
    required: true,
  },
  bookingHour: {  // number of hours user want to book
    type: Number,
    required: true,
  },
  bookingRoom: {  // Room id user want to book
    type: Number,
    required: false,
  },
  bookingSeats: { // Seats id user want to book
    type: [
      {
        type: Number,
      }
    ],
    required: false,
  },
  bookingStatus: {  // true if booking is confirmed by owner , false if owner didn't confirm
    type: Boolean,
    required: true,
  },
  paymentStatus: {  // true if payment is done , false if payment is not done
    type: Boolean,
    default: false,
    required: true,
  },
  paymentMethod: { // {Cash , Credit Card , Wallet}
    type: String,
    required: true,
  },
  productID: {  // in the future
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'products',
        select: true,
      },
    ],
  },
  startTime: {  // start time of booking
    type: Number,
    required: true,
  },
  endTime: {  // end time of booking
    type: Number,
    required: false,
  },
  bookingType: {  // {Seat , Room}
    type: String,
    enum: ['silentSeat', 'Room' , 'sharedAreaSeat'],
    required: true,
  },
});
module.exports = booking = mongoose.model('booking', bookingSchema);
