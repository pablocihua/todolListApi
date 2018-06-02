'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

// Models
const Models       = require('../models/userModel'),
      CouchDB      = require('../models/couchdbModel'),
      couchNano    = CouchDB.conexionNano(),
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
        // console.log( UserViews )
        /* var first = { startkey: params.email },
        seconds = {{{ endkey: params.email }, sort: 'asc'}, skip: 0};
        UserViews.findOneByEmail( first, seconds, function( error, result ){
            if( error ){ res.status( 401 ).send({ message: error }) };
            console.log( error, result )
            return result;
        }); */

        var mangoQuery    = {
            include_docs: false,
            "selector": {
                "email": { "$eq": params.email.toLowerCase() },
                "tipodedocumento": { "$eq": "user" }
            },
            //limit: 1,
            skip: 0
        };
        couchNano
        .view( 'users', 'by_email', mangoQuery, ( error, data ) => {
            console.log( data.rows );
            var user    = data.rows[ 0 ].value;
            if( user ){
                res.status( 200 ).send({
                    message: 'El usuario no puede registrarse.',
                    u: params
                });
            } else {
                res.status( 200 ).send({
                    message: 'El usuario no puede registrarse.'
                });
                // Encripting password
                bcrypt.hash( params.password, null, null, ( err, hash ) => {
                    user.password = hash;
                    // Save user in database.
                    user.save(( err, userStored ) => {
                        if( err ){
                            res.status( 500 ).send({ message: 'Error al guardar el usuario'});
                        } else {
                            if( !userStored ){
                                res.status( 404 ).send({ message: 'No se ha registrado el usuario'});
                            } else {
                                res.status( 200 ).send({ user: userStored, message: 'Se ha registrado el usuario'});
                            }
                        }
                    });
                });
            }
        });

        response.message    = 'Se ha registrado el usuario.';
        response.user       = req.user;
    } else {
        response.message    = 'El usuario no puede registrarse.';
        res.status( _status ).send( response );
    }
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