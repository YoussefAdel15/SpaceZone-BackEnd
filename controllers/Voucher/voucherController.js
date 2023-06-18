const { promisify } = require('util');
const mongoose = require('mongoose');
const axios = require('axios');

const AppError = require('../../utils/appError');
const Voucher = require('./../../Models/voucher');
const catchAsync = require('./../../utils/catchAsync');
const User = require('./../../Models/user');
const user = require('./../../Models/user');

function generateVoucherCode(length) {
  let code = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    code += characters.charAt(randomIndex);
  }

  return code;
}

function generateRandomNumber() {
  return Math.floor(Math.random() * 6) + 5;
}

exports.payVoucher = async (req, res, next) => {
  const paymobToken = await generatePaymobToken();
  const priceToPay = req.body.voucherValue + req.body.voucherValue * 0.14;
  if (!paymobToken) {
    return next(new AppError('Error in generating paymob token', 400));
  }
  const id = await generatePaymentId(paymobToken, priceToPay, 'Voucher');
  if (!id) {
    return next(new AppError('Payment Failed !', 402));
  }
  const data = await generatePaymentToken(paymobToken, priceToPay, id.id);
  if (!data) {
    return next(new AppError('Payment Failed !', 402));
  }
  try {
    const voucher = await Voucher.create({
      voucherCode: generateVoucherCode(generateRandomNumber()),
      voucherValue: req.body.voucherValue,
      orderID: id.id,
    });
    const url = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${data}`;
    res.status(200).json({
      status: 'Success',
      massage: 'Voucher created successfully',
      voucher,
      url,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

exports.consumeVoucher = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  const voucherCode = req.body.voucherCode;
  const voucher = await Voucher.findOne({ voucherCode: voucherCode });
  if (!voucher) {
    return next(new AppError('Voucher not found', 400));
  }
  if (voucher.used) {
    return next(new AppError('Voucher already used', 400));
  }
  voucher.used = true;
  voucher.userID = currentUser.id;
  currentUser.wallet += voucher.voucherValue;
  await currentUser.save();
  await voucher.delete();
  res.status(200).json({
    status: 'Success',
    massage: `Voucher with code ${voucherCode} has been consumed successfully`,
    data: voucher,
  });
});

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

exports.successPayment = catchAsync(async (req, res, next) => {
    const { order } = req.query;
    const voucher = await Voucher.findOne({ orderID: order });
    if (!voucher) {
        return next(new AppError('Voucher not found', 400));
    }
    voucher.active = true;
    await voucher.save();
    res.status(200).json({
        status: 'Success',
        massage: `Voucher with code ${voucher.voucherCode} has been activated successfully`,
        voucher,
    });
});