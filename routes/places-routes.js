/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const placeController = require('./../controllers/Place/placeController');
const authOwnerController = require('./../controllers/Owner/authOwnerController');
const apiFeatures = require('./../utils/apiFeatures');
const authController = require('./../controllers/User/authController');
const router = express.Router();

//GET ALL PLACES ROUTE (USER AND OWNER AND UNREGISTERED USER CAN ACCESS THIS ROUTE )
router.route('/getAllPlaces').get(placeController.getAllPlaces);

//GET PLACE BY ID ROUTE (USER AND OWNER AND UNREGISTERED USER CAN ACCESS THIS ROUTE )
router.route('/:id').get(placeController.getPlace);

//EDIT THE PLACE THAT THE OWNER IS OPENING NOW
router
  .route('/editThisPlace/:id')
  .patch(authOwnerController.protect, placeController.editThisPlace);

router
  .route('/addFeedback/:id')
  .post(
    authController.protect,
    authController.restrictTo('User', 'Admin'),
    placeController.addFeedback
  );
module.exports = router;
