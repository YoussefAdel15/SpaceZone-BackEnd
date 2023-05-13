const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'You Must Enter Your Name To send This Form'],
  },
  email: {
    type: String,
    required: [
      true,
      'please enter your email in order to be contacted shortly',
    ],
  },
  phone: {
    type: String,
    required: [true, 'please enter your phone number'],
    max: 11,
    min: 11,
  },
  message: {
    type: String,
    required: [true, 'please enter the body of the message'],
  },
});

module.exports = contactUs = mongoose.model('ContactUs', contactUsSchema);
