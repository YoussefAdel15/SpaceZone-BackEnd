/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const userController = require('./../controllers/User/userController');
const authController = require('./../controllers/User/authController');
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { check, validationResult } = require('express-validator');

const router = express.Router();

const startsWith = (value) => {
  if (
    !value.startsWith('012') ||
    !value.startsWith('011') ||
    !value.startsWith('015') ||
    !value.startsWith('010')
  ) {
    throw new Error('The string must start with 011 or 012 or 010 or 015');
  }
  return true;
};

router.post(
  '/signupUser',
  [
    [
      check('userName', 'Name is required').not().isEmpty(),
      check('email', 'please include a valid email').isEmail(),
      check(
        'number',
        'please enter your phone number (01*********) 11 digit phone number'
      ).isLength({ min: 11, max: 11 }),
      check(
        'number',
        'The string must start with 011 or 012 or 010 or 015'
      ).custom(startsWith),
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

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('User', 'Admin'),
    userController.getUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('User', 'Admin'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('User', 'Admin'),
    userController.deleteUser
  );

router.route('/logout').post(authController.logOut);
module.exports = router;
