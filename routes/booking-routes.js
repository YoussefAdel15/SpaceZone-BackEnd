const express = require('express');
const bookingController = require('../controllers/Booking/bookingController');

const router = express.Router();

router.post('/checkAvailability/:id', bookingController.checkAvailability);

module.exports = router;
