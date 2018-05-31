'use strict'

var jwt       = require('jwt-simple'),
    moment    = require('moment'),
    _config   = require('../../config/config.json');

var secret    = _config.jwt.secret;

exports.createToken    = function( user ){
    var payload    = {
        sub: user._id,
        "username": user.username,
        "password": user.password,
        "email": user.email,
        "role": user.role,
        "active": user.active,
        iat: moment().unix(),
        exp: moment().add( 3, 'minutes' ).unix
    };

    return jwt.encode( payload, secret );
};