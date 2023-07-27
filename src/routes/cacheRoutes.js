const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cacheController');

cacheController.cacheOptionsData();

module.exports = router;
