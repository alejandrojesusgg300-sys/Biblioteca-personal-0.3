'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const apiRoutes = require('./routes/api.js');

const app = express();

app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/healthz', function (req, res) {
  res.send('ok');
});

apiRoutes(app);

app.use(function (req, res) {
  res.status(404).send('Not Found');
});

const port = process.env.PORT || 3000;

const listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app;
