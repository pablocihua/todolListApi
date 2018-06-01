'use strict'

var jwt       = require('jwt-simple'),
    moment    = require('moment'),
    _config   = require('../../config/config');

var secret    = _config.jwt.secret;

exports.ensureAuth    = function( req, res, next ){
    if( !req.headers.authorization ){
        res.status( 403 ).send({
            message: 'The request does not have any authentication header!'
        });
    }
    // Get the token by header and delete the quotes.
    var token;
    if( req.headers.hasOwnProperty('authorization'))
        token    = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode( token, secret, true );

        if( payload.exp <= moment().unix() ){
            res.status( 401 ).send({
                message: 'La sessión ha expirado!'
            });
        }
    } catch( ex ){
        res.status( 404 ).send({
            message: 'Sessión no valida ' + ex
        });
    }

    req.user    = payload;

    next();
}