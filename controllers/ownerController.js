/* eslint-disable import/no-useless-path-segments */
const Owner = require('./../Models/owner');
const catchAsync = require('./../utils/catchAsync');
const Place = require('./../Models/place');

exports.getAllOwners = catchAsync(async (req, res) => {
  const users = await Owner.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Owner.findByIdAndUpdate(req.owner.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//TODO : Need to be completed
exports.createPlaceForOwner = catchAsync(async (req, res, next) => {
  const newPlace = new Place({
    placeName: req.body.placeName,
    placePhotos: req.body.placePhotos,
    address: req.body.address,
    googleAddress: req.body.address,
    hourPrice: req.body.hourPrice,
    vipHourPrice: req.body.vipHourPrice,
    numberOfSeats: req.body.numberOfSeats,
    numberOfRooms: req.body.numberOfRooms,
    openAt: req.body.openAt,
    closeAt: req.body.closeAt,
  });
  await newPlace.save();

  // const owner = await Owner.findById(ownerId);
  //   owner.places.push(newPlace);
  //   await owner.save();
});

exports.getOwner = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.createOwner = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.updateOwner = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.deleteOwner = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.getPlaces = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
