const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  placeID: {
    type: mongoose.Schema.ObjectId,
    ref: 'places',
    select: true,
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    select: true,
  },
  feedbackText: {
    type: String,
    required: true,
  },
  feedbackNumber: {
    type: Number,
    required: [true, 'feedback Must Have rate'],
    max: 5,
    min: 0,
  },
});

module.exports = feedback = mongoose.model('feedback', feedbackSchema);
