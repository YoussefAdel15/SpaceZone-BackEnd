const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  placeID: {
    type: mongoose.Schema.ObjectId,
    ref: 'places',
    select: true,
  },
  offerValue: {
    type: Number,
    required: [true, 'Offer Must contain value'],
    min: 1,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = offer = mongoose.model('offer', offerSchema);
