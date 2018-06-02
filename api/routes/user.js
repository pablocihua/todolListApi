'use strict'

var express = require('express');

var AuthController    = require('../controllers/authentication'),
    UserController    = require('../controllers/user');

var api        = express.Router();
var md_auth    = require('../middlewares/authenticated');

var multipart    = require('connect-multiparty'),
    md_upload    = multipart({ uploadDir: './uploads/users'});

api.get('/test-controller', AuthController.test );
api.post('/login', AuthController.login );
api.post('/register', md_auth.ensureAuth, UserController.saveUser );

module.exports = api;