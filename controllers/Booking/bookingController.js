const mongoose = require('mongoose');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');

const Place = require('../../Models/place');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.checkAvailability = catchAsync(async (req, res, next) => {
    const currentPlace = await Place.findById(req.params.id);
    const Date = new Date(req.body.startDate);
    const startTime = req.body.startDate;
    const endTime = req.body.endDate;

});