const express = require('express');
const ConfirmPayment = require('../controllers/ConfirmPayment');
const router = express.Router();

router.get('/confirm', ConfirmPayment.successPayment);

module.exports = router;
