const express = require('express');
const bodParser = require('body-parser');

const app = express();

app.use(express.json());

app.use('/api/user', require('./routes/user-routes'));
app.use('/api/places', require('./routes/places-routes'));

module.exports = app;
