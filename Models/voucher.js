const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  voucherCode: {
    type: String,
    required: true,
  },
  voucherValue: {
    type: Number,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
    required: true,
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  },
  active: {
    type: Boolean,
    default: false,
    required: true,
    },
    orderID :{
        type: String,
        required: true,
    }
});
module.exports = voucher = mongoose.model('voucher', voucherSchema);
