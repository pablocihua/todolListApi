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

module.exports = api;