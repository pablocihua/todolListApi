'use strict'

var jwt       = require('jwt-simple'),
    moment    = require('moment');

var secret    = 'key_secret_this_application_web';

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
};