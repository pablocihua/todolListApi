'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');
// Loads configs and conects Db.
const config     = require('../../../../config/config'),
      CouchDB    = require('../models/CouchdbModel'),
      couchNano    = CouchDB.conexionNano(),
      couchNode    = CouchDB.conexionNodeCouch();
      _views       = CouchDB.getViews( couchNano );

// Service jwt
var jwt    = require('../services/JwtService');
// Call to config database.
const couchDb    = config.databases.couchdb,
      dbNames    = couchDb.dbnames,
      dbName     = dbNames.dbName;


// Actions

function test( req, res ){
    res.status( 200 ).send({
        message: 'Test authentication controller test method.'
    });
}

function login( req, res ){
    var params      = req.body,
    email       = params.email,
    password    = params.password;
    
    var mangoQuery    = {
        "selector": {
            "email": { "$eq": email.toLowerCase() },
            "tipodedocumento": { "$eq": "user" }
        },
        limit: 1,
        skip: 0
    };

    couchNode
    .mango( dbName, mangoQuery, {} )
    .then( ( data ) => {
        // console.log( data, params );
        /* bcrypt.hash( password, null, null, ( err, hash ) => {
            console.log( hash )
        }) */
        // console.log( data.data.docs[ 0 ] );
        var user    = data.data.docs[ 0 ];
        if( user ){
            bcrypt.compare( password, user.password, ( err, check ) => {
                if( check ){
                    if( params.gettoken ){
                        res.status( 200 ).send({
                            token: jwt.createToken( user ),
                            apiPaths: _views // dbNames.views
                        });
                    } else {
                        res.status( 200 ).send( user );
                    }
                } else {
                    res.status( 200 ).send({
                        title: 'Acceso a Usuarios',
                        text: 'Ok',
                        message: 'El usuario "' + email.toUpperCase() + '" no ha podido loguearse correctamente'
                    });
                }
            });
        } else {
            res.status( 404 ).send({
                title: 'Acceso Incorrecto',
                text: 'Ok',
                message: 'El usuario no ha podido loguearse!'
            });
        }
    }, 
    ( err ) => {
        res.status( 500 ).send({ message: 'Error al comprobar el usuario. ' + err })
    }
    );
}

module.exports    = {
    test,
    login
};