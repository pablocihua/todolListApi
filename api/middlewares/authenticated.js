'use strict'

var jwt       = require('jwt-simple'),
    moment    = require('moment');

var secret    = 'key_secret_the_application_web';

exports.ensureAuth    = function( req, res, next ){
    if( !req.headers.authorization ){
        res.status( 403 ).send({
            message: 'The request does not have any header!'
        });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload    = jwt.decade( token, secret );
        if( payload.exp <= moment.unix() ){
            res.status( 401 ).send({
                message: 'La sessión ha expirado!'
            });
        }
    } catch( ex ){
        res.status( 401 ).send({
            message: 'Sessión no valida!'
        });
    }
}