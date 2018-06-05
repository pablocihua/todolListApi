'use strict'

var express = require('express');

var UserController    = require('../controllers/UserController');

var api        = express.Router();
var md_auth    = require('../../acl/middlewares/AuthenticatedMiddleware');

var multipart    = require('connect-multiparty'),
    md_upload    = multipart({ uploadDir: './data/uploads/users'}),
    md_hasPermission    = require('../../acl/middlewares/HasPermissionMiddleware');

api.post('/register-user', md_auth.ensureAuth, UserController.saveUser );
api.post('/upload-image-user/:id', [ md_auth.ensureAuth, md_upload ], UserController.uploadImage ); // , md_hasPermission.hasPermission

module.exports = api;