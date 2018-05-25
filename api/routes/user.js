'use strict'

var express = require('express');

var AuthController = require('../controllers/authentication');

var api        = express.Router();
var md_auth    = require('../middlewares/authenticated');

var multipart    = require('connect-multiparty'),
    md_upload    = multipart({ uploadDir: './uploads/users'});

api.get('/test-controller', md_auth.ensureAuth, AuthController.test );

module.exports = api;