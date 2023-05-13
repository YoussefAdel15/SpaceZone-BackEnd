const express = require('express');
const { check } = require('express-validator');
const contactUsController = require('../controllers/contactUs/contactUsController');

const router = express.Router();

router.post(
  '/sendContactUsForm',
  [
    [
      check('email', 'please include a valid email').isEmail(),
      check('phone')
        .matches(/^01[0125]\d{8}$/)
        .withMessage(
          'Phone number must start with 010, 011, 012, or 015 and be 11 digits long'
        ),
      check('message', 'Please enter the message body').not().isEmpty(),
    ],
  ],
  contactUsController.sendContactUs
);

router.get(
  '/getContactUsForms',
  contactUsController.protect,
  contactUsController.restrictTo('Admin'),
  contactUsController.getContactUs
);

module.exports = router;
