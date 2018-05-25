'use strict'

var app = require('./server');

var port = process.env.PORT || 3501;

app.listen( port, () => {
    console.log('Starting Restful API started on: ' + port );
});