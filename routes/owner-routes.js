/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const ownerController = require('./../controllers/Owner/ownerController');
const authOwnerController = require('./../controllers/Owner/authOwnerController');
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

// GET ALL PLACES ROUTE (WAS FOR TEST ONLY)
router
  .route('/places')
  .get(authOwnerController.protect, ownerController.getPlaces);

// ADD A PLACE FOR SPECIFIC OWNER
router
  .route('/addOwnerPlaces')
  .post(authOwnerController.protect, ownerController.createPlaceForOwner);

//GET OWNER PLACES
router
  .route('/getOwnerPlaces')
  .get(authOwnerController.protect, ownerController.getPlaces);

module.exports = router;
