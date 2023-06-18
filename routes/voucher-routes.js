const express = require('express');
const voucherController = require('../controllers/Voucher/voucherController');
const authController = require('../controllers/User/authController');

const router = express.Router();

router.post('/payVoucher', voucherController.payVoucher);

router.post('/consumeVoucher', authController.protect , voucherController.consumeVoucher);

router.post('/successVoucher', voucherController.successVoucher);

module.exports = router;