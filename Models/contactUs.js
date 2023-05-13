const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, 'You Must Enter Your Name To send This Form'],
  },
  Email: {
    type: String,
    required: [
      true,
      'please enter your email in order to be contacted shortly',
    ],
  },
  Phone: {
    type: String,
    required: [true, 'please enter your phone number'],
    max: 11,
    min: 11,
  },
  Message: {
    type: String,
    required: [true, 'please enter the body of the message'],
  },
});

module.exports = contactUs = mongoose.model('ContactUs', contactUsSchema);
