/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const userController = require('./../controllers/User/userController');
const authController = require('./../controllers/User/authController');
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { check, validationResult } = require('express-validator');

const router = express.Router();

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
        'password',
        'Please enter a password with at least 8 chars'
      ).isLength({
        min: 8,
      }),
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

module.exports = router;
