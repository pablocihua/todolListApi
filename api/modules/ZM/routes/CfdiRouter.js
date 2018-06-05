'use strict';

var express = require('express');
var router  = express.Router();

var cfdi = require('../controllers/CfdiController');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './data'});

router.get('/cfdi', cfdi.cfdiTimbre )
      .post('/cfdi-upload', [ md_upload ], cfdi.uploadXml );

module.exports = router;