const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, 'You Must Add Your Name'],
  },
  Email: {
    type: String,
    required: [true, 'You Must Add Your Email'],
  },
  Phone: {
    type: String,
    required: [true, 'You Must Add You Phone Number'],
    min: 11,
    max: 11,
  },
  message: {
    type: String,
    required: [true, 'You Must Add Message Body'],
  },
});

module.exports = contactUs = mongoose.model('contactUs', contactUsSchema);
