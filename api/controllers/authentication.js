'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

// Service jwt
var jwt = require('../services/jwt');

// Actions
function test( req, res ){
    res.status( 200 ).send({
        message: 'Test authentication controller test method.'
    });
}

function login( req, res ){
    var params = req.body;

    res.status( 200 ).send({
        message: 'Access successfully!'
    });
}

module.exports    = {
    test,
    login
};