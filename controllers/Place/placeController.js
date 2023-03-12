/* eslint-disable import/no-useless-path-segments */
const Place = require('./../../Models/place');
const catchAsync = require('./../../utils/catchAsync');

exports.getAllPlaces = catchAsync(async (req, res, next) => {
  const places = await Place.find();

  res.status(200).json({
    status: 'success',
    results: places.length,
    data: {
      places,
    },
  });
});
