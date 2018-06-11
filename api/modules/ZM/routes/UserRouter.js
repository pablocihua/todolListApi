'use strict'

var express = require('express');

var UserController    = require('../controllers/UserController');

var api        = express.Router();
var md_auth    = require('../../acl/middlewares/AuthenticatedMiddleware');

var multipart    = require('connect-multiparty'),
    md_upload    = multipart({ uploadDir: './data/uploads/users'}),
    md_hasPermission    = require('../../acl/middlewares/HasPermissionMiddleware');

api.post('/register-user', md_auth.ensureAuth, UserController.saveUser );
api.post('/update-user/:id', md_auth.ensureAuth, UserController.updateUser );
api.post('/upload-image-user/:id', [ md_auth.ensureAuth, md_upload ], UserController.uploadImage ); // , md_hasPermission.hasPermission
api.post('/get-users/:id', UserController.getUsers );
api.get('/get-image-user/:id/:imageFile', UserController.getImageAttachment );

module.exports = api;