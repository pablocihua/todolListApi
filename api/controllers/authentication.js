'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

const config    = require('../../config/config'),
      couch     = require('../models/couchdbModel');

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

    const dbName     = config.databases.couchdb.dbName,
          viewUrl    = config.databases.couchdb.viewUrl;

    couch.couch()
    .get( dbName, viewUrl )
    .then(( data, headers, status ) => {
        /* function (doc) {
            emit( doc._id, {rev: doc._rev, username: doc.username, password: doc.password, email: doc.email, role: doc.role, active: doc.active});
        } */
        //console.log( data.data.rows, params );
        var result    = data.data.rows.filter( function( row ){
            return 
                row.value.username == params.username 
            && row.value.password == params.password
            && row.value.active == true
        });
        console.log( rs )
        result.forEach( element => {
            
        });
        res.status( 200 ).send({ user: rs[ 0 ] });
    }, err => {
        // either request error occured
        // ...or err.code=EDOCMISSING if document is missing
        // ...or err.code=EUNKNOWN if statusCode is unexpected
        res.send( err )
    });

    /* res.status( 200 ).send({
        message: 'Access successfully!'
    }); */
}

module.exports    = {
    test,
    login
};