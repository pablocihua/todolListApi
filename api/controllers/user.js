'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

// Interfaces
var UserI    = require('../models/interfaces/user')();

// Models
const Models       = require('../models/userModel'),
      CouchDB      = require('../models/couchdbModel'),
      couchNano    = CouchDB.conexionNano(),
      couchNode    = CouchDB.conexionNodeCouch(),
    //   UserModel    = Models.Model.create( UserI ),
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
    var _validate    = validaterequiredFields( params, UserI );
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
            "selector": {
                "email": { "$eq": params.email.toLowerCase() },
                "tipodedocumento": { "$eq": "user" }
            }
        };

        couchNode
        .mango( dbName, mangoQuery, {} )
        .then( ( data ) => {
        // couchNano
        // .view( 'users', 'by_email', mangoQuery, ( error, data ) => {
            // var user    = data.rows[ 0 ].value;
            if( data.data.docs.length ){
                res.status( _status ).send({
                    message: 'El usuario no puede registrarse.',
                    u: params
                });
            } else {
                // Encripting password
                bcrypt.hash( params.password, null, null, ( err, hash ) => {
                    params.password = hash;
                    UserI    = fillInterface( params, UserI );
                    var UserModel    = Models.Model.create( UserI );
                    // Save user in database.
                    UserModel.save(( function( error ){
                        if( error ){
                            _status    = 500;
                            response.message    = 'Error al guardar el usuario';
                        } else {
                            _status    = 200;
                            response.message    = 'Se ha registrado el usuario';
                            response.user       = UserModel;
                        }
                        res.status( _status ).send( response );
                    }));

                    response.message    = 'Se ha registrado el usuario';
                    response.user    = user;
                    res.status( 200 ).send( response );
                });
            }
        },
        ( err ) => {
            res.status( 500 ).send({ message: 'Error al comprobar el usuario. ' + err })
        }
        );

        response.message    = 'Se ha registrado el usuario.';
        response.user       = req.user;
    } else {
        response.message    = 'El usuario no puede registrarse.';
        res.status( _status ).send( response );
    }
}


function uploadImage( req, res ){
    res.status( 200 ).send({ message: 'Upload image' });
}

function validaterequiredFields( fields, _interface ){
    var _Result   = {
        isValid: true,
        fields: []
    };

    Object.keys( fields ).forEach(( field, position ) => {
        if( _interface[ field ].hasOwnProperty('required') && !fields[ field ].length ){
            _Result.fields.push({
                name: field,
                required: _interface[ field ].required || 'This field is required'
            });
        } else {
            // The field has a value.
        }
    });

    _Result.isValid    = _Result.isValid && !_Result.fields.length;

    return _Result;
}

function fillInterface( params, _interface ){
    Object.keys( params ).forEach(( field ) => {
        if( _interface.hasOwnProperty( field )){
            _interface[ field ]    = params[ field ];
        } else {
            // It does not add any value.
        }
    });
    Object.keys( _interface ).forEach(( field ) => {
        if( _interface[ field ].hasOwnProperty('default')){
            _interface[ field ]    = _interface[ field ].default;
        } else {
            // It haven't defaul value.
        }
    });

    return _interface;
}

module.exports   = {
    saveUser,
    uploadImage
};