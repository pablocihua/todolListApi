'use strict'

var express        = require('express'),
    bodyParser     = require('body-parser'),
    NodeCouchDb    = require('node-couchdb'),
    app            =  express();

// Load routes.
var cfdi_route        = require('./api/modules/ZM/routes/CfdiRouter'),
    authentication    = require('./api/modules/ZM/routes/UserRouter'),
    client            = require('./api/modules/ZM/routes/ClientRouter'),
    config            = require('./api/modules/ZM/routes/ConfigRouter'),
    acl               = require('./api/modules/acl/routes/AclRouter');

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

//routes( app );
app.use('/api', authentication );
app.use('/api', acl );
app.use('/api', cfdi_route );
app.use('/api', client );
app.use('/api', config );

module.exports    = app;
