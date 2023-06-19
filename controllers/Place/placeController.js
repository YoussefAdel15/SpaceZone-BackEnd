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
const Product = require('./../../Models/products');
const Offer = require('./../../Models/offer');

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

exports.getPlaces = catchAsync(async (req, res, next) => {

  const places = await Place.find();

  res.status(200).json({
    status: 'success',
    places
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
  const currentUser = await User.findById(req.user.id);
  const place = await Place.findById(req.params.id);
  if (!place) {
    return next(new AppError('Place not found', 400));
  } else {
    const newFeedback = new Feedback({
      placeID: place.id,
      userID: currentUser.id,
      feedbackText: req.body.feedbackText,
      feedbackNumber: req.body.feedbackNumber,
      userName: currentUser.userName,
    });
    const feedbacks = place.feedbacks;
    console.log(feedbacks);
    var sum = 0;
    for (let i = 0; i < feedbacks.length; i += 1) {
      const feedbackDetails = await Feedback.findById(feedbacks[i]);
      console.log(feedbackDetails);
      console.log(feedbackDetails.feedbackNumber);
      console.log(feedbackDetails.feedbackNumber + sum);
      sum = sum + feedbackDetails.feedbackNumber;
      console.log(sum);
    }
    console.log(sum);
    place.feedbacks.push(newFeedback);
    sum = sum + newFeedback.feedbackNumber;
    place.rating = sum / feedbacks.length;
    await place.save();
    await newFeedback.save();
    res.status(200).json({
      status: 'Success',
      massage: `Feedback added to place with id ${place.id} from user with id ${currentUser.id}`,
      data: newFeedback,
    });
  }
});

exports.getFeedbackByPlace = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  if (!currentPlace) {
    return next(new AppError('Place not found', 400));
  } else {
    const feedbackDetails = await Feedback.find({ placeID: currentPlace.id });
    res.status(200).json({
      status: 'Success',
      massage: `feedbacks for place ${req.params.id} has been found successfully`,
      data: feedbackDetails,
    });
  }
});

exports.addProduct = catchAsync(async (req, res, next) => {
  const currentOwner = await Owner.findById(req.owner.id);
  const place = await Place.findById(req.params.id);
  const places = currentOwner.places;
  const reqID = mongoose.Types.ObjectId(req.params.id);
  const DoesBelong = await places.find((place) => place._id.equals(reqID));
  if (!DoesBelong) {
    return next(new AppError('This Place Does not Belong to you', 401));
  } else {
    const newProduct = new Product({
      placeID: place.id,
      productName: req.body.productName,
      price: req.body.price,
    });
    place.products.push(newProduct);
    await place.save();
    await newProduct.save();
    res.status(200).json({
      status: 'Success',
      massage: `product ${newProduct.productName} added to place with id ${place.id} with price of ${newProduct.price}EGP`,
      data: newProduct,
    });
  }
});

exports.getProducts = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  if (!currentPlace) {
    return next(new AppError('Place not found', 400));
  } else {
    const productsDetails = await Product.find({ placeID: currentPlace.id });
    res.status(200).json({
      status: 'Success',
      massage: `products for place ${req.params.id} has been found successfully`,
      data: productsDetails,
    });
  }
});

exports.addOffer = catchAsync(async (req, res, next) => {
  const currentOwner = await Owner.findById(req.owner.id);
  const place = await Place.findById(req.params.id);
  const places = currentOwner.places;
  const reqID = mongoose.Types.ObjectId(req.params.id);
  const DoesBelong = await places.find((place) => place._id.equals(reqID));
  if (!DoesBelong) {
    return next(new AppError('This Place Does not Belong to you', 401));
  } else {
    const newOffer = new Offer({
      placeID: place.id,
      offerValue: req.body.offerValue,
    });
    place.offers.push(newOffer);
    await place.save();
    await newOffer.save();
    res.status(200).json({
      status: 'Success',
      massage: `offer with value of ${newOffer.offerValue}EGP added to place with id ${place.id}`,
      data: newOffer,
    });
  }
});

exports.getOffers = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  if (!currentPlace) {
    return next(new AppError('Place not found', 400));
  } else {
    const offersDetails = await Offer.find({ placeID: currentPlace.id });
    res.status(200).json({
      status: 'Success',
      massage: `offers for place ${req.params.id} has been found successfully`,
      data: offersDetails,
    });
  }
});
