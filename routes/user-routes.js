/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const userController = require('./../controllers/User/userController');
const authController = require('./../controllers/User/authController');
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { check } = require('express-validator');
const twilio = require('./../utils/twilio');

const router = express.Router();

/*

Validations For The user Signup
1) userName Required
2) valid Email
3) phoneNumber start with (010,011,012,015) and 11 digits long
4) password must be at least 8 characters (includes at least 1 lowercase , 1 uppercase and 1 digit)

*/

router.post(
  '/signupUser',
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
  authController.Signup
);

router.post('/loginUser', authController.login);
router.post('/forgotPasswordUser', authController.forgotPassword);
router.patch('/resetPasswordUser/:token', authController.resetPassword);

router.route('/').get(userController.getAllUsers);

// router
//   .route('/:id')
//   .get(
//     authController.protect,
//     authController.restrictTo('User', 'Admin'),
//     userController.getUser
//   )
//   .patch(
//     authController.protect,
//     authController.restrictTo('User', 'Admin'),
//     userController.updateUser
//   )
//   .delete(
//     authController.protect,
//     authController.restrictTo('User', 'Admin'),
//     userController.deleteUser
//   );

router.route('/logout').post(authController.logOut);

router.post('/phone/send-otp', authController.protect, twilio.sendOTP);
router.post('/phone/verify-otp', authController.protect, twilio.verifyOTP);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

module.exports = router;
