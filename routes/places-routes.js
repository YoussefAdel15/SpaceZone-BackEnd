const express = require('express');
const placeController = require('./../controllers/Place/placeController');
const authOwnerController = require('./../controllers/Owner/authOwnerController');
const apiFeatures = require('./../utils/apiFeatures');
const authController = require('./../controllers/User/authController');
const router = express.Router();

//GET ALL PLACES ROUTE (USER AND OWNER AND UNREGISTERED USER CAN ACCESS THIS ROUTE )
router.route('/getAllPlaces').get(placeController.getPlaces);

//GET PLACE BY ID ROUTE (USER AND OWNER AND UNREGISTERED USER CAN ACCESS THIS ROUTE )
router.route('/:id').get(placeController.getPlace);

//EDIT THE PLACE THAT THE OWNER IS OPENING NOW
router
  .route('/editThisPlace/:id')
  .patch(authOwnerController.protect, placeController.editThisPlace);

//ADD FEEDBACK BY THE USER
router
  .route('/addFeedback/:id')
  .post(
    authController.protect,
    authController.restrictTo('User', 'Admin'),
    placeController.addFeedback
  );

//GET FEEDBACKS FOR A SPECIFIC PLACE
router.route('/getFeedBacks/:id').get(placeController.getFeedbackByPlace);

//ADD PRODUCT FOR A PLACE
router
  .route('/addProducts/:id')
  .post(
    authOwnerController.protect,
    authOwnerController.restrictTo('Owner', 'Admin'),
    placeController.addProduct
  );

//GET PLACE PRODUCTS
router.route('/getProducts/:id').get(placeController.getProducts);

//ADD OFFER
router
  .route('/addOffer/:id')
  .post(
    authOwnerController.protect,
    authOwnerController.restrictTo('Owner', 'Admin'),
    placeController.addOffer
  );

//GET ALL OFFERS
router
  .route('/getOffers/:id')
  .get(
    authOwnerController.protect,
    authOwnerController.restrictTo('Owner', 'Admin'),
    placeController.getOffers
  );

//GLOBAL OFFER

module.exports = router;
