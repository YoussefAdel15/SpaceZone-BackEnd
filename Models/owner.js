/* eslint-disable import/no-useless-path-segments */
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AppError = require('./../utils/appError');

const ownerSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Owner Must Have A UserName'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Owner Must have Email'],
  },
  number: {
    type: String,
    required: [true, 'Owner Must have a phone Number'],
  },
  password: {
    type: String,
    required: [true, 'Owner Must Have Password'],
    select: false,
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'must confirm your password'],
  },
  role: {
    type: String,
    select: false,
    default: 'Owner',
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
});

// Password Encryption
ownerSchema.pre('save', async function (next) {
  if (this.passwordConfirmation === this.password) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirmation = undefined;
    next();
  } else {
    throw new AppError('password are not the same !', 401);
  }
});

// compare between two the password entered and password in the database using hash function
ownerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//Creating password reset token
ownerSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(16).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

ownerSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // due to the delay of writing on the database we - 1s to make it more accurate (not soo accurate)
  next();
});
// eslint-disable-next-line no-multi-assign, no-undef
module.exports = owners = mongoose.model('owners', ownerSchema);

