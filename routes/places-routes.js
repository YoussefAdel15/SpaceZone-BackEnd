/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const placeController = require('./../controllers/Place/placeController');

const router = express.Router();

//GET ALL PLACES ROUTE (USER AND OWNER AND UNREGISTERED USER CAN ACCESS THIS ROUTE )
router.route('/getAllPlaces').get(placeController.getAllPlaces);

module.exports = router;
