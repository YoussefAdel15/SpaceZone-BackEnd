/* eslint-disable import/no-useless-path-segments */
const Owner = require('./../Models/owner');
const catchAsync = require('./../utils/catchAsync');

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
