'use strict'

const config       = require('../../config/config'),
      couch        = config.databases.couchdb,
      dbNames      = couch.dbnames,
      dbName       = dbNames.dbName,
      viewUsers    = dbNames.views.users;

var couchDbModel    = require('couchdb-model'),
    couchDb         = require('./couchdbModel');

var Model    = couchDbModel( couchDb.conexionCouch() ),
    UserModel    = Model.create(
        {
        "name": {
            "type": String,
            "required": "Kindly enter the name of the user"
        },
        "surname": {
            "type": String,
            "required": "Kindly enter the surname of the user"
        },
        "username": {
            "type": String,
            "required": "Kindly enter the username of the user"
        },
        "password": {
            "type": String,
            "required": "Kindly enter the password of the user"
        },
        "email": {
            "type": String,
            "required": "Kindly enter the email of the user"
        },
        "job": {
            "type": String,
            "required": "Kindly enter the role of the user"
        },
        "role": {
            "type": String,
            "required": "Kindly enter the name of the user"
        },
        "created_at": {
            "type": Date,
            "default": Date.now()
        },
        "created_by": {
            "type": String,
            "required": "Kindly enter the User who made the record"
        },
        "updated_at": {
            "type": Date
        },
        "updated_by": {
            "type": String,
            "required": "Kindly enter the User who updated the record"
        },
        "alive": {
            "type": Boolean,
            "required": "Kindly enter if user is alive"
        },
        "active": {
            "type": Boolean,
            "required": "Kindly enter if user is active"
        },
        "tipodedocumento": "user"
    }),
    UserViews    = couchDbModel( couchDb.conexionCouch(), {
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
    UserModel,
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