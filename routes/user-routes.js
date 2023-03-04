/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { check, validationResult } = require('express-validator');

const router = express.Router();

router.post(
  '/signup',
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
        'Please enter a password with atleast 8 chars'
      ).isLength({
        min: 8,
      }),
    ],
  ],
  authController.Signup
);

router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
