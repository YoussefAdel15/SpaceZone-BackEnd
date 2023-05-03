/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-useless-path-segments */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Place = require('./../../Models/place');
const catchAsync = require('./../../utils/catchAsync');
const Owner = require('./../../Models/owner');
const AppError = require('../../utils/appError');
const apiFeatures = require('./../../utils/apiFeatures');
const Feedback = require('./../../Models/feedback');
const User = require('./../../Models/user');

exports.getAllPlaces = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(Place.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const places = await features.query;

  res.status(200).json({
    status: 'success',
    results: places.length,
    data: {
      places,
    },
  });
});

exports.getPlace = catchAsync(async (req, res, next) => {
  const place = await Place.findById(req.params.id);
  res.status(200).json({
    status: 'Success',
    massage: `place ${req.params.id} has been found successfully`,
    data: place,
  });
});

exports.editThisPlace = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentOwner = await Owner.findById(decoded.id);
  // eslint-disable-next-line prefer-destructuring
  const places = currentOwner.places;
  const reqID = mongoose.Types.ObjectId(req.params.id);
  const DoesBelong = await places.find((place) => place._id.equals(reqID));
  if (!DoesBelong) {
    return next(new AppError('This Place Does not Belong to you', 401));
  }

  const newPlace = await Place.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    status: 'Success',
    massage: `place ${req.params.id} has been updated successfully`,
    data: newPlace,
  });
});

exports.addFeedback = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  const place = await Place.findById(req.params.id);
  if (!place) {
    return next(new AppError('Place not found', 400));
  } else {
    const feedbackRate = [0, 1, 2, 3, 4, 5];
    if (feedbackRate.includes(req.body.feedbackNumber)) {
      const newFeedback = new Feedback({
        placeID: place.id,
        userID: currentUser.id,
        feedbackText: req.body.feedbackText,
        feedbackNumber: req.body.feedbackNumber,
      });
      console.log(newFeedback);
      console.log(place);
      console.log(place.feedbacks);
      place.feedbacks.push(newFeedback);
      await place.save();
      await newFeedback.save();
      res.status(200).json({
        status: 'Success',
        massage: `Feedback added to place with id ${place.id} from user with id ${currentUser.id}`,
        data: newFeedback,
      });
    } else {
      return next(
        new AppError('feedback rate must be (0,1,2,3,4,5) only', 400)
      );
    }
  }
});
