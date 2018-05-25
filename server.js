'use strict'

var express    = require('express'),
    app        =  express(),
    bodyParser = require('body-parser');

// Load routes.
var cfdi_route        = require('./api/routes/cfdiRouter'),
    authentication    = require('./api/routes/user');

// Middlewares of body-parser
app.use( bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() );

// Config head and cors
app.use( function( req, res, next ){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Accept-Control-Allow-Request-Method');
    res.header('Access-control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//routes( app );
app.use('/api', cfdi_route );
app.use('/api', authentication );

module.exports    = app;
