/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const ownerController = require('./../controllers/ownerController');
const authOwnerController = require('./../controllers/authOwnerController');
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { check, validationResult } = require('express-validator');

const router = express.Router();

//SignUp For Owner
router.post(
  '/signUpOwner',
  [
    [
      check('userName', 'Name is required').not().isEmpty(),
      check('email', 'please include a valid email').isEmail(),
      check(
        'number',
        'please enter your phone number (01*********) 11 digit phone number'
      ).isLength({ min: 11, max: 11 }),
      check(
        'password',
        'Please enter a password with at least 8 chars'
      ).isLength({
        min: 8,
      }),
    ],
  ],
  authOwnerController.SignupOwner
);

//Login For Owner
router.post('/loginOwner', authOwnerController.loginOwner);

//Forgot Password for Owner
router.post('/forgotPasswordOwner', authOwnerController.forgotPasswordOwner);

//Reset Password for Owner
router.patch(
  '/resetPasswordOwner/:token',
  authOwnerController.resetPasswordOwner
);

router
  .route('/places')
  .get(authOwnerController.protect, ownerController.getPlaces);

router
  .route('/getOwnerPlaces')
  .post(authOwnerController.protect, ownerController.createPlaceForOwner);
// router
//   .route('/')
//   .get(ownerController.getAllUsers)
//   .post(ownerController.createUser);

// router
//   .route('/:id')
//   .get(ownerController.getUser)
//   .patch(ownerController.updateUser)
//   .delete(ownerController.deleteUser);

module.exports = router;
