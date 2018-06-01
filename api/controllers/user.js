'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

// Models
var Models       = require('../models/userModel'),
    // couch        = require('../models/couchdbModel'),
    UserModel    = Models.UserModel,
    UserViews    = Models.UserViews,
    // Configs
    config       = require('../../config/config');

// Services
var jwt    = require('../services/jwt');

const couchDb    = config.databases.couchdb,
      dbNames    = couchDb.dbnames,
      dbName     = dbNames.dbName,
      viewUrl    = dbNames.views.users.by_email;

function saveUser( req, res ){
    // Final response.
    var response    = {
        title: 'Registro de Usuarios',
        message: '',
        text: 'Ok',
    },
    _status    = 200;
    // Get request params.
    var    params    = req.body;

    var _validate    = validaterequiredFields( params );
    if( _validate.isValid ){
        // console.log( )
        UserViews.findOneByEmail( params.email, function( error, result ){
            if( error ){ res.status( 401 ).send({ message: error }) };
            console.log( error, result )
            return result;
        });
        response.message    = 'Se ha registrado el usuario.';
        response.user       = req.user;
    } else {
        response.message    = 'El usuario no puede registrarse.';
    }

    res.status( _status ).send( response );
}

function validaterequiredFields( fields ){
    var _Result   = {
        isValid: true,
        fields: []
    };

    Object.keys( fields ).forEach(( field, position ) => {
        if( UserModel[ field ].hasOwnProperty('required') && !fields[ field ].length ){
            _Result.fields.push({
                name: field,
                required: UserModel[ field ].required
            });
        } else {
            // The field has a value.
        }
    });

    _Result.isValid    = _Result.isValid && !_Result.fields.length;

    return _Result;
}

module.exports   = {
    saveUser
};