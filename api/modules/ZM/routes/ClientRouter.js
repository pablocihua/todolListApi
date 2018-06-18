'use strict'

var express = require('express');

var ClientController    = require('../controllers/ClientController');

var api        = express.Router();
var md_auth    = require('../../acl/middlewares/AuthenticatedMiddleware');

// var multipart    = require('connect-multiparty'),
//     md_upload    = multipart({ uploadDir: './data/uploads/users'});

api.post('/register-client', md_auth.ensureAuth, ClientController.saveClient );
api.post('/update-client/:id', md_auth.ensureAuth, ClientController.updateClient );
// api.post('/upload-image-client/:id', [ md_auth.ensureAuth, md_upload ], ClientController.uploadImage );
api.post('/get-clients/:id', ClientController.getClients );
api.get('/get-image-client/:id/:imageFile', ClientController.getImageAttachment );
api.delete('/remove-image-client/:id/:imageFile', md_auth.ensureAuth, ClientController.removeImage );
api.post('/searching-client', md_auth.ensureAuth, ClientController.searchClient );

module.exports = api;