const express = require('express');
const bookingController = require('../controllers/Booking/bookingController');
const authController = require('../controllers/User/authController');

const router = express.Router();

router.post('/checkAvailability/:id', bookingController.checkAvailabilitySeats);

router.post(
  '/checkAvailabilitySilent/:id',
  bookingController.checkAvailabilitySilentSeats
);

router.post(
  '/checkAvailabilityRoom/:pid/:rid',
  bookingController.checkAvailabilityRooms
);

router.post('/getOpenHours/:id', bookingController.getOpenHours);

router.post(
  '/bookSeat/:id',
  authController.protect,
  bookingController.bookSeat
);

router.post(
  '/bookRoom/:pid/:rid',
  authController.protect,
  bookingController.bookRoom
);

module.exports = router;
