'use strict'

const config       = require('../../../../config/config'),
      couch        = config.databases.couchdb,
      dbNames      = couch.dbnames,
      dbName       = dbNames.dbName,
      viewUsers    = dbNames.views.users;

var couchDbModel    = require('couchdb-model'),
    couchDb         = require('../../../modules/acl/models/CouchdbModel');

var Model    = couchDbModel( couchDb.conexionNano() ),
    UserViews    = couchDbModel( couchDb.conexionNano(), {
        views: [
            viewUsers.all,
            {
                path: viewUsers.by_email,
                name: 'by_email'
            }
        ]
    }),
    xModel    = Model.create({
        'uno': '',
        'dos': ''
    });

module.exports    = {
    Model,
    xModel,
    UserViews
};