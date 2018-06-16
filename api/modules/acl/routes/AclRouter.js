'use strict'

var express = require('express');

var api    = express.Router();
// Specials Middleware.
var multipart    = require('connect-multiparty');
// Middlewares
var md_auth          = require('../middlewares/AuthenticatedMiddleware'),
    md_permission    = require('../middlewares/HasPermissionMiddleware');
// Controllers
var AuthController    = require('../controllers/AuthenticationController'),
    AclController     = require('../controllers/AclController');

// var permissions    = AclController.getPermissions();
// console.log( __dirname );
// for( var ind in AclController ){
//     console.log(  ind );
// }

api.get('/test-controller', AuthController.test );
api.post('/login', AuthController.login );

api.get('/acl-controller', AclController.index );
api.post('/get-actions/:id', AclController.getActions );
api.post('/get-roles/:id', AclController.getRoles );
api.post('/get-controllers/:id', AclController.getControllers );
api.post('/get-permissions/:id', AclController.getPermissions );
api.post('/searching-acl', md_auth.ensureAuth, AclController.searchItem );

module.exports = api;