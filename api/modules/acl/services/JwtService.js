'use strict'

var jwt       = require('jwt-simple'),
    moment    = require('moment'),
    _config   = require('../../../../config/config');

exports.createToken    = function( user ){
var secret      = _config.jwt.secret,
    timeExp     = _config.jwt.exp.time,
    timeUnit    = _config.jwt.exp.unit;

    var payload    = {
        sub: user._id,
        "name": user.name,
        "surname": user.surname,
        "username": user.username,
        "password": user.password,
        "email": user.email,
        "role": user.role,
        "active": user.active,
        iat: moment().unix(),
        exp: moment().add( timeExp, timeUnit ).unix()
    };

    return jwt.encode( payload, secret );
};