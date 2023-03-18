/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const placeController = require('./../controllers/Place/placeController');
const authOwnerController = require('./../controllers/Owner/authOwnerController');

const router = express.Router();

//GET ALL PLACES ROUTE (USER AND OWNER AND UNREGISTERED USER CAN ACCESS THIS ROUTE )
router.route('/getAllPlaces').get(placeController.getAllPlaces);

//EDIT THE PLACE THAT THE OWNER IS OPENING NOW
router
  .route('/editThisPlace/:id')
  .patch(authOwnerController.protect, placeController.editThisPlace);

module.exports = router;
