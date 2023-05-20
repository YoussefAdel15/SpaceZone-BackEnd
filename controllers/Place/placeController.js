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
const { findByIdAndDelete } = require('./../../Models/place');

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
    });
    place.feedbacks.push(newFeedback);
    await place.save();
    await newFeedback.save();
    res.status(200).json({
      status: 'Success',
      massage: `Feedback added to place with id ${place.id} from user with id ${currentUser.id}`,
      data: newFeedback,
    });
  }
});

exports.updateFeedback = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  const place = await Place.findById(req.params.id);
  if (!place) {
    return next(new AppError('Place not found', 400));
  } else {
    const feedback = place.feedbacks.find((f) => f.id === req.params.feedbackId);
    if (!feedback) {
      return next(new AppError('Feedback not found', 404));
    }

    feedback.feedbackText = req.body.feedbackText;
    feedback.feedbackNumber = req.body.feedbackNumber;
    
    await place.save();
    res.status(200).json({
      status: 'Success',
      message: `Feedback updated for place with id ${place.id} from user with id ${currentUser.id}`,
      data: feedback,
    });
  }
});
exports.deleteFeedback = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  const feedback = await Feedback.findById(req.params.id);
  if (!Feedback) {
    return next(new AppError('Feedback not found', 400));
  } else {

    if(currentUser.id == feedback.userID){
      console.log(feedback)
      const place = await Place.findById(feedback.placeID)
      placeFeedbackDelete = await place.feedbacks.find(async(e)=> await findByIdAndDelete(e._id))
      await Feedback.findByIdAndDelete(feedback.id)
      await place.save();
    }
    
    // Remove the feedback from the array
    res.status(200).json({
      status: 'Success',
      message: `Feedback deleted for place with id ${place.id} from user with id ${currentUser.id}`,
      data: null,
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

exports.updateProduct = catchAsync(async (req, res, next) => {
  const currentOwner = await Owner.findById(req.owner.id);
  const place = await Place.findById(req.params.id);
  const places = currentOwner.places;
  const reqID = mongoose.Types.ObjectId(req.params.id);
  const doesBelong = await places.find((place) => place._id.equals(reqID));
  
  if (!doesBelong) {
    return next(new AppError('This Place Does not Belong to you', 401));
  } else {
    const product = place.products.find((p) => p._id.equals(req.params.productId));
    
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    product.productName = req.body.productName;
    product.price = req.body.price;
    
    await place.save();
    
    res.status(200).json({
      status: 'Success',
      message: `Product updated: ${product.productName} at place with id ${place.id} has a price of ${product.price}EGP`,
      data: product,
    });
  }
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const currentOwner = await Owner.findById(req.owner.id);
    const product = await Product.findById(req.params.id);
    
    const place = await Place.findById(product.placeID)
   
  
    if (!product) {
      return next(new AppError('Product not found', 400));
    } else {
      
  
      if (currentOwner.id == place.owner) {
        const place = await Place.findById(product.placeID);
        place.products.pull(product);
        await place.save();
        await Product.findByIdAndDelete(product.id);
        
        res.status(200).json({
          status: 'Success',
          message: `Product deleted for place with id ${place.id} from user with id ${currentOwner.id}`,
          data: null,
        });
      } else {
        return next(new AppError('You are not the owner of this product', 401));
      }
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

exports.updateOffer = catchAsync(async (req, res, next) => {
  const currentOwner = await Owner.findById(req.owner.id);
  const place = await Place.findById(req.params.id);
  const places = currentOwner.places;
  const reqID = mongoose.Types.ObjectId(req.params.id);
  const doesBelong = await places.find((place) => place._id.equals(reqID));
  
  if (!doesBelong) {
    return next(new AppError('This Place Does not Belong to you', 401));
  } else {
    const offer = place.offers.find((o) => o._id.equals(req.params.offerId));
    
    if (!offer) {
      return next(new AppError('Offer not found', 404));
    }
    
    offer.offerValue = req.body.offerValue;
    
    await place.save();
    
    res.status(200).json({
      status: 'Success',
      message: `Offer updated: ${offer.offerValue}EGP offer at place with id ${place.id}`,
      data: offer,
    });
  }
});

exports.deleteOffer = catchAsync(async (req, res, next) => {
  const currentOwner = await Owner.findById(req.owner.id);
  const offer = await Offer.findById(req.params.id);
  
  const place = await Place.findById(offer.placeID)
 

  if (!offer) {
    return next(new AppError('Offer not found', 400));
  } else {
    

    if (currentOwner.id == place.owner) {
      const place = await Place.findById(offer.placeID);
      place.offers.pull(offer);
      await place.save();
      await Offer.findByIdAndDelete(offer.id);
      
      res.status(200).json({
        status: 'Success',
        message: `Offer deleted for place with id ${place.id} from user with id ${currentOwner.id}`,
        data: null,
      });
    } else {
      return next(new AppError('You are not the owner of this offer', 401));
    }
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
