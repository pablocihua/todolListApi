'use strict';

var express = require('express');
var router  = express.Router();

var cfdi = require('../controllers/cfdiController');

router.get('/cfdi', cfdi.cfdiTimbre );

module.exports = router;