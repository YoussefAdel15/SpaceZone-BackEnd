/* eslint-disable no-undef */
// eslint-disable-next-line import/no-extraneous-dependencies
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'user must have a userName'],
  },
  number: {
    type: String,
    required: [true, 'user must have a number'],
  },
  email: {
    type: String,
    required: [true, 'user must have email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'user must have a password'],
    select: false,
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'must confirm your password'],
  },
  role: {
    type: String,
    default: 'User',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
});

// handle Validation errors
class ValidationError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = 'ValidationError'; // (2)
  }
}

// Password Encryption
userSchema.pre('save', async function (next) {
  if (this.passwordConfirmation === this.password) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirmation = undefined;
    next();
  } else {
    throw new ValidationError('password are not the same !');
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // due to the delay of writing on the database we - 1s to make it more accurate (not soo accurate)
  next();
});

// compare between two the password entered and password in the database using hash function
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//Creating password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(16).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
// eslint-disable-next-line no-multi-assign
module.exports = users = mongoose.model('users', userSchema);
