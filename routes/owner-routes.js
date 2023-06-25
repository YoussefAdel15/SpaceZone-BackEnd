/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const ownerController = require('./../controllers/Owner/ownerController');
const authOwnerController = require('./../controllers/Owner/authOwnerController');
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { check, validationResult } = require('express-validator');

const router = express.Router();

/*

Validations For The owner Signup
1) userName Required
2) valid Email
3) phoneNumber start with (010,011,012,015) and 11 digits long
4) password must be at least 8 characters (includes at least 1 lowercase , 1 uppercase and 1 digit)

*/

//SignUp For Owner
router.post(
  '/signUpOwner',
  [
    [
      check('userName', 'Name is required').not().isEmpty(),
      check('email', 'please include a valid email').isEmail(),
      check('number')
        .matches(/^01[0125]\d{8}$/)
        .withMessage(
          'Phone number must start with 010, 011, 012, or 015 and be 11 digits long'
        ),
      check(
        'password',
        'Please enter a password with at least 8 chars'
      ).isLength({
        min: 8,
      }),
      check(
        'password',
        'Password must contain at least one lowercase letter'
      ).matches(/[a-z]/),
      check(
        'password',
        'Password must contain at least one uppercase letter'
      ).matches(/[A-Z]/),
      check('password', 'Password must contain at least one number').matches(
        /\d/
      ),
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

//DELETE OWNER ACCOUNT / GET OWNER DATA /  UPDATE OWNER DATA
router
  .route('/:id')
  .delete(
    authOwnerController.protect,
    authOwnerController.restrictTo('Owner', 'Admin'),
    ownerController.deleteOwner
  )
  .get(
    authOwnerController.protect,
    authOwnerController.restrictTo('Owner', 'Admin'),
    ownerController.getOwner
  )
  //TODO
  .patch(
    authOwnerController.protect,
    authOwnerController.restrictTo('Owner', 'Admin'),
    ownerController.updateOwner
  );

router.route('/me').get(authOwnerController.protect, ownerController.getMe);
router
  .route('/updateMe')
  .patch(authOwnerController.protect, ownerController.updateMe);
router
  .route('/deleteMe')
  .delete(authOwnerController.protect, ownerController.deleteMe);

router.route('/resetDays/:id').post(ownerController.resetDays);

router
  .route('/resetDaysForAllPlaces')
  .post(ownerController.resetDaysForAllPlaces);

module.exports = router;
