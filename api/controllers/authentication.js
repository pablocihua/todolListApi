'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

const config    = require('../../config/config'),
      couch     = require('../models/couchdbModel').conexionCouch();

// Service jwt
var jwt = require('../services/jwt');

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

    const couchDb    = config.databases.couchdb,
          dbNames    = couchDb.dbnames,
          dbName     = dbNames.dbName,
          viewUrl    = dbNames.views.users.by_email;

    var mangoQuery    = {
        "selector": {
            "email": { "$eq": email.toUpperCase() },
            "tipodedocumento": { "$eq": "user" }
        },
        limit: 1,
        skip: 0
    };

    couch
    .search( 'users', 'by_email', { email: email.toLowerCase() }, function( err, doc ){
        if( !err ){
            doc.rows.forEach(function( d ){
                console.log( d.value );
            });
           res.status( 200 ).send({ val: doc.rows });
        }
console.log( err )
        res.status( 200 ).send( err );
    });

    //.conexionCouch()
    /* couch
    .mango( dbName, mangoQuery, {} )
    .then(( data ) => {
        console.log( data, params );
        bcrypt.hash( password, null, null, ( err, hash ) => {
            console.log( hash )
        })
        var user    = data.data.docs[ 0 ];
        // console.log( user, data.data.docs )
        if( user ){
            bcrypt.compare( password, user.password, ( err, check ) => {
                if( check ){
                    if( params.gettoken ){
                        res.status( 200 ).send({
                            token: jwt.createToken( user ),
                            apiPaths: dbNames.views
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
                message: 'El usuario no ha podido loguearse!'
            });
        }
    }, err => {
        res.status( 500 ).send({ message: 'Error al comprobar el usuario. ' + err })
    }); */
}

module.exports    = {
    test,
    login
};