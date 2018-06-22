'use strict'

var express = require('express');

var CatalogController    = require('../controllers/CatalogController');

var api        = express.Router();
var md_auth    = require('../../acl/middlewares/AuthenticatedMiddleware');

var multipart    = require('connect-multiparty'),
    md_upload    = multipart({ uploadDir: './data/uploads/users'});

api.post('/register-catalog', md_auth.ensureAuth, CatalogController.saveCatalog );
api.post('/update-catalog/:id', md_auth.ensureAuth, CatalogController.updateCatalog );
api.post('/upload-image-catalog/:id', [ md_auth.ensureAuth, md_upload ], CatalogController.uploadImage );
api.post('/get-catalogs/:id', CatalogController.getCatalogs );
api.get('/get-image-catalog/:id/:imageFile', CatalogController.getImageAttachment );
api.delete('/remove-image-catalog/:id/:imageFile', md_auth.ensureAuth, CatalogController.removeImage );
api.post('/searching-catalog', md_auth.ensureAuth, CatalogController.searchCatalog );

module.exports = api;