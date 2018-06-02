'use strict'

var express = require('express');

var AuthController    = require('../controllers/authentication'),
    UserController    = require('../controllers/user');

var api        = express.Router();
var md_auth    = require('../middlewares/authenticated');

var multipart    = require('connect-multiparty'),
    md_upload    = multipart({ uploadDir: './data/uploads/users'}),
    md_hasPermission    = require('../middlewares/hasPermission');

api.get('/test-controller', AuthController.test );
api.post('/login', AuthController.login );
api.post('/register-user', md_auth.ensureAuth, UserController.saveUser );
api.post('/upload-image-user/:id', [ md_auth.ensureAuth, md_upload, md_hasPermission.hasPermission ], UserController.uploadImage );

module.exports = api;