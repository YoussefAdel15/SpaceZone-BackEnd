const mongoose = require('mongoose');
const https = require('https');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');
const axios = require('axios');
const Booking = require('../../Models/booking');

const Place = require('../../Models/place');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.checkAvailabilitySeats = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  let date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  const numberOfSeats = req.body.numberOfSeats;
  date = date.toISOString().split('T')[0];
  let availableSeatsIndex = [];
  let availableSeats = 0;
  function hasConsecutiveNumbers(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }
  if (startTime < endTime) {
    for (let i = 0; i < currentPlace.numberOfSeats; i++) {
      for (let j = 0; j < currentPlace.seats[i].days.length; j++) {
        if (
          // check if the date is equal to the date he wants
          currentPlace.seats[i].days[j].date.toISOString().split('T')[0] ===
          date
        ) {
          if (currentPlace.seats[i].days[j].hours.length === 0) {
            // working space is off
            res.status(200).json({
              status: 'fail',
              message: 'Place is not available',
            });
            break;
          }
          if (availableSeats === numberOfSeats) {
            // he checked all the seats and found the number of seats he wants so he breaks the loop and return the available seats
            break;
          } else if (availableSeats < numberOfSeats) {
            let availableHours = 0;
            let availableHoursIndex = [];
            for (let k = startTime; k < endTime; k++) {
              if (
                currentPlace.seats[i].days[j].hours.array[k] == false &&
                availableHours < numberOfHours
              ) {
                // check if the seat is available and if the number of hours is less than the number of hours he wants
                // add the hour to the available hours array and increment the available hours
                availableHours++;
                availableHoursIndex.push(k);
              }
              if (
                availableHours === numberOfHours &&
                availableSeats < numberOfSeats
              ) {
                // check if the number of hours is equal to the number of hours he wants and if the number of seats is less than the number of seats he wants
                // check if the hours are consecutive
                if (hasConsecutiveNumbers(availableHoursIndex)) {
                  // if the hours are consecutive then increment the available seats and add the seat index to the available seats array and break the loop
                  availableSeats++;
                  availableSeatsIndex.push(i);
                  break;
                }
              }
            }
          }
        }
      }
    }
  } else {
    res.status(200).json({
      status: 'fail',
      message: 'Invalid time',
    });
  }
  if (availableSeats < numberOfSeats && availableSeatsIndex.length > 0) {
    res.status(200).json({
      status: 'fail',
      message: `No available seats at the moment, available seats numbers is ${availableSeatsIndex.length}`,
    });
  }
  if (availableSeats === numberOfSeats && availableSeatsIndex.length > 0) {
    res.status(200).json({
      status: 'success',
      availableSeatsIndex,
    });
  }
}); //DONE

exports.checkAvailabilitySilentSeats = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  let date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  const numberOfSeats = req.body.numberOfSeats;
  date = date.toISOString().split('T')[0];
  let availableSeatsIndex = [];
  let availableSeats = 0;
  // console.log(currentPlace.silentSeats[0].days);
  function hasConsecutiveNumbers(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }
  console.log(Array.isArray(currentPlace.silentSeats[0].days));
  if (startTime < endTime) {
    for (let i = 0; i < currentPlace.numberOfSeats; i++) {
      // check if the silent seat is not null and if the silent seat has days and if the days is an array
      if (
        currentPlace.silentSeats &&
        currentPlace.silentSeats[i] &&
        currentPlace.silentSeats[i].days &&
        Array.isArray(currentPlace.silentSeats[i].days)
      ) {
        for (let j = 0; j < currentPlace.silentSeats[i].days.length; j++) {
          if (
            // check if the date is equal to the date he wants
            currentPlace.silentSeats[i].days[j].date
              .toISOString()
              .split('T')[0] === date
          ) {
            if (currentPlace.silentSeats[i].days[j].hours.length === 0) {
              // working space is off
              res.status(200).json({
                status: 'fail',
                message: 'Place is not available',
              });
              break;
            }
            if (availableSeats === numberOfSeats) {
              // he checked all the seats and found the number of seats he wants so he breaks the loop and return the available seats
              break;
            } else if (availableSeats < numberOfSeats) {
              let availableHours = 0;
              let availableHoursIndex = [];
              for (let k = startTime; k < endTime; k++) {
                if (
                  currentPlace.silentSeats[i].days[j].hours.array[k] == false &&
                  availableHours < numberOfHours
                ) {
                  // check if the seat is available and if the number of hours is less than the number of hours he wants
                  // add the hour to the available hours array and increment the available hours
                  availableHours++;
                  availableHoursIndex.push(k);
                }
                if (
                  availableHours === numberOfHours &&
                  availableSeats < numberOfSeats
                ) {
                  // check if the number of hours is equal to the number of hours he wants and if the number of seats is less than the number of seats he wants
                  // check if the hours are consecutive
                  if (hasConsecutiveNumbers(availableHoursIndex)) {
                    // if the hours are consecutive then increment the available seats and add the seat index to the available seats array and break the loop
                    availableSeats++;
                    availableSeatsIndex.push(i);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
  } else {
    res.status(200).json({
      status: 'fail',
      message: 'Invalid time',
    });
  }
  if (availableSeats < numberOfSeats && availableSeatsIndex.length > 0) {
    res.status(200).json({
      status: 'fail',
      message: `No available seats at the moment, available seats numbers is ${availableSeatsIndex.length}`,
    });
  }
  if (availableSeats === numberOfSeats && availableSeatsIndex.length > 0) {
    res.status(200).json({
      status: 'success',
      availableSeatsIndex,
    });
  }
}); //DONE

exports.checkAvailabilityRooms = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.pid);
  const room = currentPlace.rooms.find((e) => e._id == req.params.rid);
  let date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  date = date.toISOString().split('T')[0];
  let done = false;

  function hasConsecutiveNumbers(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }

  if (startTime < endTime) {
    for (let j = 0; j < room.days.length; j++) {
      if (room.days[j].date.toISOString().split('T')[0] === date) {
        if (room.days[j].hours.length === 0) {
          done = true;
          res.status(200).json({
            status: 'fail',
            message: 'Place is not available',
          });
          break;
        }
        let availableHours = 0;
        let availableHoursIndex = [];
        for (let k = startTime; k <= endTime; k++) {
          if (
            room.days[j].hours.array[k] === false &&
            availableHours < numberOfHours
          ) {
            availableHours++;
            availableHoursIndex.push(k);
          }
          if (availableHours === numberOfHours) {
            if (hasConsecutiveNumbers(availableHoursIndex)) {
              break;
            }
          } else if (k === endTime - 1) {
            done = true;
            res.status(200).json({
              status: 'fail',
              message: `Room is Not available at the moment`,
            });
            break;
          }
        }
      }
    }
  } else {
    res.status(200).json({
      status: 'fail',
      message: 'Invalid time',
    });
  }
  if (done === false) {
    res.status(200).json({
      status: 'success',
      message: `Room number ${room.roomNumber} is available from ${
        startTime > 12 ? startTime - 12 : startTime
      } ${startTime > 12 ? 'PM' : 'AM'} to ${
        endTime > 12 ? endTime - 12 : endTime
      } ${endTime > 12 ? 'PM' : 'AM'}`,
      RoomNumber: room.roomNumber,
    });
  }
}); //DONE

exports.getOpenHours = catchAsync(async (req, res, next) => {
  const currentPlace = await Place.findById(req.params.id);
  let date = new Date(req.body.Date);
  const day = date.getDay();
  date = date.toISOString().split('T')[0];
  const openHours = currentPlace.openingHours[day];
  let openHoursArray = [];
  function getActiveHours(date, openingHours, dayIndex) {
    const dayOpeningHours = openingHours[dayIndex];

    if (dayOpeningHours && !dayOpeningHours.closed) {
      return dayOpeningHours.closeTime - dayOpeningHours.openTime;
    }

    return 0;
  }
  const activeHours = getActiveHours(date, currentPlace.openingHours, day);
  if (activeHours > 0) {
    for (let i = 0; i <= activeHours; i++) {
      openHoursArray.push(currentPlace.openingHours[day].openTime + i);
    }
    res.status(200).json({
      status: 'success',
      openHoursArray,
    });
  } else {
    res.status(200).json({
      status: 'fail',
      message: 'Place is Closed at the moment',
    });
  }
}); //DONE

exports.bookSeat = catchAsync(async (req, res, next) => {
  // startTime , date , endTime , numberOfSeats , paymentMethod
  const currentPlace = await Place.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  const numberOfSeats = req.body.numberOfSeats;
  let availableSeatsIndex = [];

  try {
    const response = await axios.post(
      `https://spacezone-backend.cyclic.app/api/booking/checkAvailability/${req.params.id}`,
      {
        Date: date,
        startTime,
        endTime,
        numberOfHours,
        numberOfSeats,
      }
    );

    if (response.data.status === 'success') {
      availableSeatsIndex = response.data.availableSeatsIndex;

      const priceToPay = currentPlace.hourPrice * numberOfHours * numberOfSeats;
      const paymentMethod = req.body.paymentMethod;
        // Payment start
        if (paymentMethod === 'Credit Card') {
          const paymobToken = await generatePaymobToken();
          if (!paymobToken) {
            return next(new AppError('Payment Failed !', 402));
          }
          const id = await generatePaymentId(paymobToken, priceToPay, "SharedAreaSeats");
          if (!id) {
            return next(new AppError('Payment Failed !', 402));
          }
          const data = await generatePaymentToken(
            paymobToken,
            priceToPay,
            id.id
          );
          if (!data) {
            return next(new AppError('Payment Failed !', 402));
          }
          console.log(id.id);
          // create booking and add it to the user
          const booking = await Booking.create({
            placeID: req.params.id,
            userID: req.user.id,
            placeName: currentPlace.placeName,
            priceToPay,
            bookingDate: date,
            bookingHour: numberOfHours,
            startTime: startTime,
            endTime: endTime,
            bookingSeat: availableSeatsIndex.length,
            bookingStatus: true,
            paymentStatus: false,
            paymentMethod: req.body.paymentMethod,
            bookingSeats: availableSeatsIndex,
            bookingType: 'sharedAreaSeat',
            orderID : id.id,
          });
          user.booking.push(booking);
          await user.save();
          const url = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${data}`;
          res.status(200).json({
            status: 'success',
            message: 'Seat booked successfully',
            url
          });
        } else if (paymentMethod === "Cash") {
          const booking = await Booking.create({
            placeID: req.params.id,
            userID: req.user.id,
            placeName: currentPlace.placeName,
            priceToPay,
            bookingDate: date,
            bookingHour: numberOfHours,
            startTime: startTime,
            endTime: endTime,
            bookingSeat: availableSeatsIndex.length,
            bookingStatus: true,
            paymentStatus: false,
            paymentMethod: req.body.paymentMethod,
            bookingSeats: availableSeatsIndex,
            bookingType: 'sharedAreaSeat',
          });
          user.booking.push(booking);
          await user.save();
          // update the seat hours to booked
          for (let i = 0; i < availableSeatsIndex.length; i++) {
            currentPlace.seats[availableSeatsIndex[i]].days.forEach((e) => {
              // check if the date is equal to the date he wants to book
              if (
                e.date.toISOString().split('T')[0] ===
                date.toISOString().split('T')[0]
              ) {
                // update the hours to booked from the start time to the end time
                for (let j = startTime; j < endTime; j++) {
                  if (e.hours.array[j] === false) {
                    e.hours.array[j] = true;
                  } else {
                    break;
                  }
                }
                // mark the document as modified to save the changes
                currentPlace.markModified(`seats.${availableSeatsIndex[i]}.days`); // Mark this part of the document as modified
              }
            });
          }
          // save the changes to the database
          await currentPlace.save();
          res.status(200).json({
            status: 'success',
            message: 'Seat booked successfully',
          });
        } else if(paymentMethod === "Wallet"){
          if(user.wallet < priceToPay){
            res.status(200).json({
              status: 'fail',
              message: 'Not enough balance in your wallet',
            });
          }else{
            const booking = await Booking.create({
              placeID: req.params.id,
              userID: req.user.id,
              placeName: currentPlace.placeName,
              priceToPay,
              bookingDate: date,
              bookingHour: numberOfHours,
              startTime: startTime,
              endTime: endTime,
              bookingSeat: availableSeatsIndex.length,
              bookingStatus: true,
              paymentStatus: true,
              paymentMethod: req.body.paymentMethod,
              bookingSeats: availableSeatsIndex,
              bookingType: 'sharedAreaSeat',
            });
            user.booking.push(booking);
            await user.save();
            // update the seat hours to booked
            for (let i = 0; i < availableSeatsIndex.length; i++) {
              currentPlace.seats[availableSeatsIndex[i]].days.forEach((e) => {
                // check if the date is equal to the date he wants to book
                if (
                  e.date.toISOString().split('T')[0] ===
                  date.toISOString().split('T')[0]
                ) {
                  // update the hours to booked from the start time to the end time
                  for (let j = startTime; j < endTime; j++) {
                    if (e.hours.array[j] === false) {
                      e.hours.array[j] = true;
                    } else {
                      break;
                    }
                  }
                  // mark the document as modified to save the changes
                  currentPlace.markModified(`seats.${availableSeatsIndex[i]}.days`); // Mark this part of the document as modified
                }
              });
            }
            user.wallet -= priceToPay;
            await user.save();
            // save the changes to the database
            await currentPlace.save();
            res.status(200).json({
              status: 'success',
              message: 'Seat booked successfully',
            });
          }
        } else{
          res.status(200).json({
            status: 'fail',
            message: 'Invalid payment method',
          });
        }
      
    }else{
      res.status(200).json({
        status: 'fail',
        message: 'No available seats at the moment',
      });
    }
  } catch (error) {
    // handle errors
    res.status(500).json({
      status: 'error',
      message: 'Error fetching data from sub-API',
      error: error.message,
    });
  }
}); //DONE

exports.bookRoom = catchAsync(async (req, res, next) => {
  // startTime , date , endTime , numberOfSeats , paymentMethod
  const currentPlace = await Place.findById(req.params.pid);
  const user = await User.findById(req.user.id);
  const date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  const room = currentPlace.rooms.find((e) => e._id == req.params.rid);
  try {
    const roomID = req.params.rid;
    const placeID = req.params.pid;
    console.log(roomID, placeID);
    const dataSentToSubAPI = {
      Date: req.body.Date,
      startTime: startTime,
      endTime: endTime,
    };
    const response = await axios.post(
      `https://spacezone-backend.cyclic.app/api/booking/checkAvailabilityRoom/${placeID}/${roomID}`,
      dataSentToSubAPI
    );
    const priceToPay = room.price * numberOfHours;
    if (response.data.status === 'success') {
      // Payment start
      if (req.body.paymentMethod === 'Credit Card') {
        const paymobToken = await generatePaymobToken();
        if (!paymobToken) {
          return next(new AppError('Payment Failed !', 402));
        }
        const id = await generatePaymentId(paymobToken, priceToPay, roomID);
        if (!id) {
          return next(new AppError('Payment Failed !', 402));
        }
        const data = await generatePaymentToken(paymobToken, priceToPay, id.id);
        if (!data) {
          return next(new AppError('Payment Failed !', 402));
        }
        // create booking and add it to the user
        const booking = await Booking.create({
          placeID: req.params.pid,
          userID: req.user.id,
          placeName: currentPlace.placeName,
          priceToPay,
          bookingDate: date,
          bookingHour: numberOfHours,
          startTime: startTime,
          endTime: endTime ,
          bookingRoom: room.roomNumber,
          bookingStatus: true,
          paymentStatus: false,
          paymentMethod: req.body.paymentMethod,
          bookingType: 'Room',
          orderID : id.id,
          roomID : req.params.rid,
        });
        const url = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${data}`;
        res.status(200).json({
          status: 'success',
          message: 'Room booked successfully',
          url,
        });

        user.booking.push(booking);
        await user.save();
        //payment end
      } else if (req.body.paymentMethod === 'Cash') {
        // create booking and add it to the user
        const booking = await Booking.create({
          placeID: req.params.pid,
          userID: req.user.id,
          placeName: currentPlace.placeName,
          priceToPay,
          bookingDate: date,
          bookingHour: numberOfHours,
          startTime: startTime > 12 ? startTime - 12 : startTime,
          endTime: endTime > 12 ? endTime - 12 : endTime,
          bookingRoom: room.roomNumber,
          bookingStatus: true,
          paymentStatus: false,
          paymentMethod: req.body.paymentMethod,
        });
        room.days.forEach((e) => {
          // check if the date is equal to the date he wants to book
          if (
            e.date.toISOString().split('T')[0] ===
            date.toISOString().split('T')[0]
          ) {
            // update the hours to booked from the start time to the end time
            for (let j = startTime; j < endTime; j++) {
              if (e.hours.array[j] === false) {
                e.hours.array[j] = true;
              } else {
                break;
              }
            }
            // mark the document as modified to save the changes
            currentPlace.markModified(
              `rooms.${response.data.RoomNumber - 1}.days`
            ); // Mark this part of the document as modified
          }
        });
        user.booking.push(booking);
        await user.save();
        // update the seat hours to booked
        console.log(response.data);
        // save the changes to the database
        await currentPlace.save();
        res.status(200).json({
          status: 'success',
          message: 'Room booked successfully',
        });
      } else if (req.body.paymentMethod === 'Wallet') {
        if(user.wallet < priceToPay){
          res.status(200).json({
            status: 'fail',
            message: 'Not enough balance in your wallet',
          });
        }else{
          const booking = await Booking.create({
            placeID: req.params.pid,
            userID: req.user.id,
            placeName: currentPlace.placeName,
            priceToPay,
            bookingDate: date,
            bookingHour: numberOfHours,
            startTime: startTime ,
            endTime: endTime ,
            bookingRoom: room.roomNumber,
            bookingStatus: true,
            paymentStatus: true,
            paymentMethod: req.body.paymentMethod,
            bookingType: 'Room',
          });
          user.booking.push(booking);
          await user.save();
          // update the seat hours to booked
          room.days.forEach((e) => {
            // check if the date is equal to the date he wants to book
            if (
              e.date.toISOString().split('T')[0] ===
              date.toISOString().split('T')[0]
            ) {
              // update the hours to booked from the start time to the end time
              for (let j = startTime; j < endTime; j++) {
                if (e.hours.array[j] === false) {
                  e.hours.array[j] = true;
                } else {
                  break;
                }
              }
              // mark the document as modified to save the changes
              currentPlace.markModified(
                `rooms.${response.data.RoomNumber - 1}.days`
              ); // Mark this part of the document as modified
            }
          });
          user.wallet -= priceToPay;
          await user.save();
          // save the changes to the database
          await currentPlace.save();
          res.status(200).json({
            status: 'success',
            message: 'Room booked successfully',
          });
        }
      }else{
        res.status(200).json({
          status: 'fail',
          message: 'Invalid payment method',
        });
      }
    } else if (
      response.data.status === 'fail' &&
      response.data.message === 'Room is Not available at the moment'
    ) {
      res.status(403).json({
        status: 'fail',
        message: 'Room is Not available at the time you want to book it',
      });
    } else if (
      response.data.status === 'fail' &&
      response.data.message === 'Invalid time'
    ) {
      res.status(403).json({
        status: 'fail',
        message: 'Invalid time',
      });
    }
  } catch (error) {
    // handle errors
    res.status(500).json({
      status: 'error',
      message: 'Error fetching data from sub-API',
      error: error.message,
      response: error.response && error.response.data, // Add this line
    });
  }
}); //DONE

exports.bookSilentSeat = catchAsync(async (req, res, next) => {
  // startTime , date , endTime , numberOfSeats , paymentMethod
  const currentPlace = await Place.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const date = new Date(req.body.Date);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const numberOfHours = endTime - startTime;
  const numberOfSeats = req.body.numberOfSeats;
  let availableSeatsIndex = [];

  try {
    const response = await axios.post(
      `https://spacezone-backend.cyclic.app/api/booking/checkAvailabilitySilent/${req.params.id}`,
      {
        Date: date,
        startTime,
        endTime,
        numberOfHours,
        numberOfSeats,
      }
    );

    if (response.data.status === 'success') {
      availableSeatsIndex = response.data.availableSeatsIndex;

      const priceToPay = currentPlace.hourPrice * numberOfHours * numberOfSeats;
      const paymentMethod = req.body.paymentMethod;

      if (availableSeatsIndex.length > 0) {
        // create booking and add it to the user
        if(paymentMethod === "Credit Card"){
          const paymobToken = await generatePaymobToken();
          if (!paymobToken) {
            return next(new AppError('Payment Failed !', 402));
          }
          const id = await generatePaymentId(paymobToken, priceToPay, "SilentSeat");
          if (!id) {
            return next(new AppError('Payment Failed !', 402));
          }
          const data = await generatePaymentToken(
            paymobToken,
            priceToPay,
            id.id
          );
          if (!data) {
            return next(new AppError('Payment Failed !', 402));
          }
          const booking = await Booking.create({
            placeID: req.params.id,
            userID: req.user.id,
            placeName: currentPlace.placeName,
            priceToPay,
            bookingDate: date,
            bookingHour: numberOfHours,
            startTime: startTime ,
            endTime: endTime,
            bookingSeat: availableSeatsIndex.length,
            bookingStatus: true,
            paymentStatus: false,
            paymentMethod: req.body.paymentMethod,
            bookingSeats: availableSeatsIndex,
            bookingType: 'silentSeat',
            orderID : id.id
          });
          user.booking.push(booking);
          await user.save();
          const url = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${data}`;
          res.status(200).json({
            status: 'success',
            message: 'Seat booked successfully',
            url,
          });
        }else if (paymentMethod === "Cash"){
          const booking = await Booking.create({
            placeID: req.params.id,
            userID: req.user.id,
            placeName: currentPlace.placeName,
            priceToPay,
            bookingDate: date,
            bookingHour: numberOfHours,
            startTime: startTime,
            endTime: endTime,
            bookingSeat: availableSeatsIndex.length,
            bookingStatus: true,
            paymentStatus: false,
            paymentMethod: req.body.paymentMethod,
            bookingSeats: availableSeatsIndex,
            bookingType: 'silentSeat',
          });
          user.booking.push(booking);
          await user.save();
          // update the seat hours to booked
          for (let i = 0; i < availableSeatsIndex.length; i++) {
            currentPlace.silentSeats[availableSeatsIndex[i]].days.forEach((e) => {
              // check if the date is equal to the date he wants to book
              if (
                e.date.toISOString().split('T')[0] ===
                date.toISOString().split('T')[0]
              ) {
                // update the hours to booked from the start time to the end time
                for (let j = startTime; j < endTime; j++) {
                  if (e.hours.array[j] === false) {
                    e.hours.array[j] = true;
                  } else {
                    break;
                  }
                }
                // mark the document as modified to save the changes
                currentPlace.markModified(`silentSeats.${availableSeatsIndex[i]}.days`); // Mark this part of the document as modified
              }
            });
          }
          // save the changes to the database
          await currentPlace.save();
          res.status(200).json({
            status: 'success',
            message: 'Seat booked successfully',
          });
        }else if(paymentMethod==="Wallet"){
          if(user.wallet < priceToPay){
            res.status(200).json({
              status: 'fail',
              message: 'Not enough balance in your wallet',
            });
          }else{
            const booking = await Booking.create({
              placeID: req.params.id,
              userID: req.user.id,
              placeName: currentPlace.placeName,
              priceToPay,
              bookingDate: date,
              bookingHour: numberOfHours,
              startTime: startTime,
              endTime: endTime,
              bookingSeat: availableSeatsIndex.length,
              bookingStatus: true,
              paymentStatus: true,
              paymentMethod: req.body.paymentMethod,
              bookingSeats: availableSeatsIndex,
              bookingType: 'silentSeat',
            });
            user.booking.push(booking);
            await user.save();
            // update the seat hours to booked
            for (let i = 0; i < availableSeatsIndex.length; i++) {
              currentPlace.silentSeats[availableSeatsIndex[i]].days.forEach((e) => {
                // check if the date is equal to the date he wants to book
                if (
                  e.date.toISOString().split('T')[0] ===
                  date.toISOString().split('T')[0]
                ) {
                  // update the hours to booked from the start time to the end time
                  for (let j = startTime; j < endTime; j++) {
                    if (e.hours.array[j] === false) {
                      e.hours.array[j] = true;
                    } else {
                      break;
                    }
                  }
                  // mark the document as modified to save the changes
                  currentPlace.markModified(`silentSeats.${availableSeatsIndex[i]}.days`); // Mark this part of the document as modified
                }
              });
            }
            user.wallet -= priceToPay;
            await user.save();
            // save the changes to the database
            await currentPlace.save();
            res.status(200).json({
              status: 'success',
              message: 'Seat booked successfully',
            });
          }
        }
      } else {
        res.status(200).json({
          status: 'fail',
          message: 'Invalid payment method',
        });
      }
    } else {
      res.status(200).json({
        status: 'fail',
        message: 'No available seats at the moment',
      });
    }
  } catch (error) {
    // handle errors
    res.status(500).json({
      status: 'error',
      message: 'Error fetching data from sub-API',
      error: error.message,
    });
  }
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const date = new Date(booking.bookingDate);
  const startTime = booking.startTime;
  const endTime = booking.endTime;
  const numberOfHours = endTime - startTime;
  const placeQuery = Place.findById(booking.placeID); // Assuming 'booking.placeID' contains the ID of the desired place
  const place = await placeQuery.exec(); // Execute the query and wait for the result
  const priceToPay = booking.priceToPay;
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  if (booking.bookingDate > tomorrowDate) {
    // check if the booking date is greater than tomorrow date or equal to it then he can cancel it
    if (booking.bookingSeats.length > 0) {
      // console.log("here")
      for (let i = 0; i < booking.bookingSeats.length; i++) {
        if (booking.bookingType === 'sharedAreaSeat') {
          place.seats[booking.bookingSeats[i]].days.forEach((e) => {
            // check if the date is equal to the date he wants to book
            if (
              e.date.toISOString().split('T')[0] ===
              date.toISOString().split('T')[0]
            ) {
              // update the hours to booked from the start time to the end time
              for (let j = startTime; j < endTime; j++) {
                if (e.hours.array[j] === true) {
                  console.log('here');
                  e.hours.array[j] = false;
                } else {
                  break;
                }
              }
              // mark the document as modified to save the changes
              place.markModified(`seats.${booking.bookingSeats[i]}.days`); // Mark this part of the document as modified
            }
          });
          await place.save();
        } else if (booking.bookingType === 'silentSeat') {
          place.silentSeats[booking.bookingSeats[i]].days.forEach((e) => {
            // check if the date is equal to the date he wants to book
            if (
              e.date.toISOString().split('T')[0] ===
              date.toISOString().split('T')[0]
            ) {
              // update the hours to booked from the start time to the end time
              for (let j = startTime; j < endTime; j++) {
                if (e.hours.array[j] === true) {
                  e.hours.array[j] = false;
                } else {
                  break;
                }
              }
              // mark the document as modified to save the changes
              place.markModified(`silentSeats.${booking.bookingSeats[i]}.days`); // Mark this part of the document as modified
            }
          });
          await place.save();
        }
      }
    } else if (booking.bookingRoom) {
      place.rooms.forEach((e) => {
        if (e.roomNumber === booking.bookingRoom) {
          e.days.forEach((e) => {
            // check if the date is equal to the date he wants to book
            if (
              e.date.toISOString().split('T')[0] ===
              date.toISOString().split('T')[0]
            ) {
              // update the hours to booked from the start time to the end time
              for (let j = startTime; j < endTime; j++) {
                if (e.hours.array[j] === true) {
                  e.hours.array[j] = false;
                } else {
                  break;
                }
              }
              // mark the document as modified to save the changes
              place.markModified(`rooms.${booking.bookingRoom}.days`); // Mark this part of the document as modified
            }
          });
        }
      });
      await place.save();
    }
    user.booking.splice(user.booking.indexOf(booking), 1);
    if (
      (booking.paymentMethod === 'Credit Card' ||
      booking.paymentMethod === 'Wallet') && booking.paymentStatus === true
    ) {
      user.wallet += priceToPay; // add the price to the user wallet
      await user.save();
    } else {
      await user.save();
    }
    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Booking canceled successfully',
    });
  }
   else {
    res.status(200).json({
      status: 'fail',
      message: 'You can not cancel a booking that has already passed',
    });
  }
});

//GENERAL FUNCTIONS

function checkWalletBalance(user, priceToPay) {
  if (user.wallet < priceToPay) {
    return false;
  } else {
    return true;
  }
}

// PayMob Functions
async function generatePaymobToken() {
  const requestData = {
    api_key: process.env.PAYMOB_API_KEY,
  };

  const response = await axios.post(process.env.PAYMOB_URL, requestData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.token;
}

async function generatePaymentId(paymobToken, price, name) {
  console.log(price, name);
  const requestData = {
    auth_token: paymobToken,
    delivery_needed: 'false',
    amount_cents: `${price * 100}`,
    currency: 'EGP',
    items: [
      {
        name: name,
        amount_cents: price,
        quantity: '1',
      },
    ],
  };

  const responseData = await axios.post(
    process.env.PAYMOB_REGISTRATION_URL,
    requestData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return responseData.data;
}

async function generatePaymentToken(paymobToken, price, id) {
  const paymentJSON = {
    auth_token: paymobToken,
    amount_cents: `${price * 100}`,
    expiration: 360000,
    order_id: id,
    billing_data: {
      apartment: '803',
      email: 'claudette09@exa.com',
      floor: '42',
      first_name: 'Clifford',
      street: 'Ethan Land',
      building: '8028',
      phone_number: '+86(8)9135210487',
      shipping_method: 'PKG',
      postal_code: '01898',
      city: 'Jaskolskiburgh',
      country: 'CR',
      last_name: 'Nicolas',
      state: 'Utah',
    },
    currency: 'EGP',
    integration_id: process.env.PAYMOB_INTEGRATION_ID,
  };

  const response = await axios.post(
    process.env.PAYMOB_PAYMENT_KEY_REQUEST_URL,
    paymentJSON,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.token;
}