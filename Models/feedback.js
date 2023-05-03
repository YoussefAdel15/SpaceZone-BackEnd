const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  placeID: {
    type: mongoose.Schema.ObjectId,
    ref: 'places',
    select: false,
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    select: false,
  },
  feedbackText: {
    type: String,
    required: false,
  },
  feedbackNumber: {
    type: Number,
    required: [true, 'feedback Must Have rate'],
  },
});

module.exports = feedback = mongoose.model('feedback', feedbackSchema);
