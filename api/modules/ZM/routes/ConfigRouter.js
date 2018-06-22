'use strict'

var express = require('express');

var ConfigController    = require('../controllers/ConfigController');

var api        = express.Router();
var md_auth    = require('../../acl/middlewares/AuthenticatedMiddleware');

var multipart    = require('connect-multiparty'),
    md_upload    = multipart({ uploadDir: './data/uploads/users'});

api.post('/register-config', md_auth.ensureAuth, ConfigController.saveConfig );
// api.post('/update-config/:id', md_auth.ensureAuth, ConfigController.updateConfig );
// api.post('/upload-image-config/:id', [ md_auth.ensureAuth, md_upload ], ConfigController.uploadImage );
api.post('/get-configs/:id', ConfigController.getConfigs );
// api.get('/get-image-config/:id/:imageFile', ConfigController.getImageAttachment );
// api.delete('/remove-image-config/:id/:imageFile', md_auth.ensureAuth, ConfigController.removeImage );
// api.post('/searching-config', md_auth.ensureAuth, ConfigController.searchConfig );

module.exports = api;