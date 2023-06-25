/* eslint-disable arrow-body-style */
//Constants

/* eslint-disable no-shadow */
/* eslint-disable import/no-useless-path-segments */
const { promisify } = require('util');
const Owner = require('../../Models/owner');
// eslint-disable-next-line import/order
const crypto = require('crypto');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
// eslint-disable-next-line import/no-extraneous-dependencies, import/order, no-unused-vars
const { check, validationResult } = require('express-validator');
// eslint-disable-next-line import/order
const jwt = require('jsonwebtoken');
const sendEmail = require('./../../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (owner, statusCode, res) => {
  const token = signToken(owner._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //httpOnly: true,
  };
  //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      owner,
    },
  });
};

//Methods

//Sign
exports.SignupOwner = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newOwner = await Owner.create({
    userName: req.body.userName,
    number: req.body.number,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });

  createSendToken(newOwner, 201, res);
});

//Login
exports.loginOwner = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide Email & Password!', 400));
  }
  // 2) check if the user exist && password is correct
  const owner = await Owner.findOne({ email: email }).select('+password');

  if (!owner || !(await owner.correctPassword(password, owner.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) if everything ok, send token to client

  createSendToken(owner, 201, res);
});

//Forget Password
exports.forgotPasswordOwner = catchAsync(async (req, res, next) => {
  // 1) Get owner based on posted email
  const owner = await Owner.findOne({ email: req.body.email });
  if (!owner) {
    return next(new AppError('There is no owner with this email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken = owner.createPasswordResetToken();
  await owner.save({ validateBeforeSave: false });

  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/owner/resetPasswordOwner/${resetToken}`;

  const html = `
  
  <head>
  <meta charset="utf-8">
<!--  <link rel="stylesheet" href="mystyle.css">-->
  <title>Welcome to SpaceZone</title>
<style>

.bigBox{
    
    
}

.logo{
    
    display:flex;
}
.mail{
    margin:auto;
    width:900px;
}
img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 20%;
}
title {
    color: black;
    display: block;
    margin-left: auto;
    margin-right: auto;
    text-allign: center;
}
h1 {
    color: black;
    text-align: center;
    margin: auto;
    width: 100%;
    text-allign: center;
}
p {
    color: black;
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 40%;
    text-allign: center;
}


.greeting{
text-align: center;

}

.texBody{
  text-align: center;
    margin-top:1rem;
}

.reset{
    text-align: center;
    margin:auto;
    margin-top:1rem;
}

.res{
    background-color:deepskyblue;
    border-radius:30px;
    border:deepskyblue;
    padding:1rem;
    color:white;
}
.footer{
    display:flex;
   justify-content: space-evenly;
   text-align: center;
}
a{
  color: black;
}
</style>
</head>
<body>

<div class="bigBox">
        <div class="logo">
          <img src="https://i.imgur.com/5m7J1P6.png" alt="logo Image"/>
        </div>
          <div class="mail">
            <div class="mailHead"><h1>RESETING YOUR SPACEZONE PASSWORD</h1></div>
              <div class="greeting ">
                  <h4>Hello ${owner.userName}</h4>
              </div>
              <div class="texBody ">We are very sorry that you have forgotten your password, but DON'T WORRY</div>
              <div class="reset">
              <a href="${resetURL}">
              <button class="res  "> RESET YOUR PASSWORD </button>
            </a>
              </div>
              <div class="texBody ">
                  If you didn't request this email, please beware that this might be an attempt to steal your account
              </div>

              <h5 class="texBody ">SpaceZone Team</h5>


              <div class="footer ">
                <div>
                <a href="https://tefa600.github.io/webZone/" class="home">SpaceZone</a>
                </div>
                  <div><a href="https://tefa600.github.io/Contact">Contact US</a></div>
                  <div>
                  <a href="https://tefa600.github.io/About">Terms&Conditions</a>
                  </div>
              </div>

          </div>
      </div>
</body>
</body>
`;

  try {
    await sendEmail({
      email: owner.email,
      subject: 'Your password reset token (valid for 10mins)',
      html,
    });
    res.status(200).json({
      status: 'success',
      massage: 'Token sent to email!',
    });
  } catch (err) {
    owner.passwordResetToken = undefined;
    owner.passwordResetExpires = undefined;
    await owner.save({ validateBeforeSave: false });

    return next(
      new AppError('There wase an error sending the mail. Try again later', 500)
    );
  }
});

//Reset Password
exports.resetPasswordOwner = catchAsync(async (req, res, next) => {
  //  1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const owner = await Owner.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // see if the token expired
  });

  // 2) if token has not expired, and there is user, set the new password
  if (!owner) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  owner.password = req.body.password;
  owner.passwordConfirmation = req.body.passwordConfirmation;
  owner.passwordResetToken = undefined;
  owner.passwordResetExpires = undefined;
  await owner.save();

  // 3) update changePasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(owner, 200, res);
});

// Restrict The Route to specific Roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.owner.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

//Protect Routes
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Getting the token and check if it' there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //console.log(token);

  if (!token) {
    next(new AppError('You are not logged in, please login'), 401);
  }

  // 2) Validate the token (Verification)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if owner still exists
  const currentOwner = await Owner.findById(decoded.id);
  if (!currentOwner) {
    return next(
      new AppError('The Owner belonging to this token is no longer exist.', 401)
    );
  }

  // 4) Check if user changed password after the Token was issued
  if (currentOwner.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please login again', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.owner = currentOwner;
  next();
  return currentOwner;
});
