'use strict'

var express        = require('express'),
    bodyParser     = require('body-parser'),
    NodeCouchDb    = require('node-couchdb'),
    app            =  express(),
    fs             = require('fs'),
    path           = require('path');

const modulesFolder    = [
    './api/modules/ZM/routes',
    './api/modules/acl/routes'
];

var walkSync = function( dir, filelist ){
    var files    = fs.readdirSync( dir );
    filelist     = filelist || [];
    files.forEach( function( file ){
        if( fs.statSync( path.join( dir, file )).isDirectory() ){
            filelist = walkSync( path.join( dir, file ), filelist );
        } else {
            filelist.push(file);
        }
    });

    return filelist;
};

// Middlewares of body-parser
app.use( bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() );

// Config head and cors
app.use( function( req, res, next ){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, X-Csrf-Token, Content-Type, Accept, Accept-Control-Allow-Request-Method');
    res.header('Access-control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Load routes.
modulesFolder.forEach( dir => {
    var listRoutes    = [];
    listRoutes        = listRoutes.concat( walkSync( dir, [] ));
    listRoutes.forEach( file => {
        var _route    = './' + path.join( dir, file );
        app.use('/api', require( _route ) );
    });
});

module.exports    = app;
