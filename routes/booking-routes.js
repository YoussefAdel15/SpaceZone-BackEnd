const express = require('express');
const bookingController = require('../controllers/Booking/bookingController');

const router = express.Router();

router.post('/checkAvailability/:id', bookingController.checkAvailabilitySeats);

router.post('/checkAvailabilitySilent/:id', bookingController.checkAvailabilitySilentSeats);

router.post('/checkAvailabilityRoom/:pid/:rid', bookingController.checkAvailabilityRooms);

router.get('/getOpenHours/:id', bookingController.getOpenHours);

module.exports = router;
