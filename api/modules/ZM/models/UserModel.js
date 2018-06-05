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
    //UserModel,
    xModel,
    UserViews
};

    /*

        "name": String,
        "surname": String,
        "username": String,
        "password": String,
        "email": String,
        "job": String,
        "role": String,
        "created_at": Date.now(),
        "created_by": String,
        "updated_at": Date,
        "updated_by": String,
        "alive": Boolean,
        "active": Boolean,
        "tipodedocumento": "user"
   
        {
            "_id": "fc20f079b446870e5d196e084e002a05",
            "_rev": "4-56e224683f2f783227180393d355b7f2",
            "username": "admin",
            "password": "$2a$10$mPCwYwgrUNU4ojy7pzHACeImWhc8S5ZljuvOPB2DUmqGXbGaNwPmm",
            "email": "pablocihua@gmail.com",
            "role": "ROLE_ADMIN",
            "name": "Developer Systems",
            "surname": "Administrator",
            "created_at": "",
            "created_by": "",
            "updated_at": "",
            "updated_by": "",
            "job": "Administrator",
            "alive": true,
            "active": true,
            "tipodedocumento": "user"
        }
    */