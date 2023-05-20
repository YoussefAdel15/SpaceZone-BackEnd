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

//ADD FEEDBACK BY THE USER
router
  .route('/addFeedback/:id')
  .post(
    authController.protect,
    authController.restrictTo('User', 'Admin'),
    placeController.addFeedback
  );

  //delete FEEDBACK BY THE USER
router
.route('/deleteFeedback/:id')
.delete(
  authController.protect,
  authController.restrictTo('User', 'Admin'),
  placeController.deleteFeedback
);

//UPDATE FEEDBACK BY THE USER
router
.route('/updateFeedback/:id')
.patch(
  authController.protect,
  authController.restrictTo('User', 'Admin'),
  placeController.updateFeedback
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

//delete PRODUCT FOR A PLACE
router
.route('/deleteProducts/:id')
.delete(
  authOwnerController.protect,
  authOwnerController.restrictTo('Owner', 'Admin'),
  placeController.deleteProduct
);

//update PRODUCT FOR A PLACE
router
  .route('/updateProducts/:id')
  .patch(
    authOwnerController.protect,
    authOwnerController.restrictTo('Owner', 'Admin'),
    placeController.updateProduct
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

  //delete OFFER
router
.route('/deleteOffer/:id')
.delete(
  authOwnerController.protect,
  authOwnerController.restrictTo('Owner', 'Admin'),
  placeController.deleteOffer
);

//update OFFER
router
  .route('/updateOffer/:id')
  .patch(
    authOwnerController.protect,
    authOwnerController.restrictTo('Owner', 'Admin'),
    placeController.updateOffer
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
