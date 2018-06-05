'use strict'

var jwt       = require('jwt-simple'),
    moment    = require('moment'),
    _config   = require('../../../../config/config');

var secret    = _config.jwt.secret;

exports.ensureAuth    = function( req, res, next ){
    // Final response.
    var response    = {
        title: 'Registro de Usuarios',
        message: '',
        text: 'Ok',
    },
    _status    = null;

    if( !req.headers.authorization ){
        _status    = 403;
        response.message    = 'The request does not have any authentication header!';
    }
    // Get the token by header and delete the quotes.
    var token;
    if( req.headers.hasOwnProperty('authorization'))
        token    = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode( token, secret, true );
        if( !payload.exp || payload.exp <= moment().unix() ){
            _status    = 401;
            response.message    = 'La sessión ha expirado!';
        }
    } catch( ex ){
        _status    = 404;
        response.message    = 'Sessión no valida. ' + ex;
    }

    if( _status ){
        res.status( _status ).send( response );
    }

    req.user    = payload;

    next();
}