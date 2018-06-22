'use strict'

var couchDbModel    = require('couchdb-model'),
    couchDb         = require('../../../modules/acl/models/CouchdbModel');

var Model          = couchDbModel( couchDb.conexionNano() ),
    ConfigViews    = couchDbModel( couchDb.conexionNano());

module.exports    = {
    Model,
    ConfigViews
};