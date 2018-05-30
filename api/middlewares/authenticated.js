'use strict'

var jwt       = require('jwt-simple'),
    moment    = require('moment'),
    _config   = require('../../config/config');

var secret    = _config.jwt.secret;

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