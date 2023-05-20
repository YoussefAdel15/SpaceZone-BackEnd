const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
  placeID: {
    type: mongoose.Schema.ObjectId,
    ref: 'places',
    select: true,
  },
  productName: {
    type: String,
    required: [true, 'product must have a name'],
  },
  price: {
    type: Number,
    required: [true, 'product must have a price'],
  },
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = products = mongoose.model('products', productsSchema);
