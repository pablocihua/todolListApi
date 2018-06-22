'use strict'

var couchDbModel    = require('couchdb-model'),
    couchDb         = require('../../../modules/acl/models/CouchdbModel');

var Model          = couchDbModel( couchDb.conexionNano() ),
    CatalogViews    = couchDbModel( couchDb.conexionNano());

module.exports    = {
    Model,
    CatalogViews
};