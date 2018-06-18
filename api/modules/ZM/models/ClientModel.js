'use strict'

var couchDbModel    = require('couchdb-model'),
    couchDb         = require('../../../modules/acl/models/CouchdbModel');

var Model          = couchDbModel( couchDb.conexionNano() ),
    ClientViews    = couchDbModel( couchDb.conexionNano());

module.exports    = {
    Model,
    ClientViews
};