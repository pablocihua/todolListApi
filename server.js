
var express = require('express')
app =  express(),
port = process.env.PORT || 3000,
mongoose = require('mongoose'),
Task = require('./api/models/todoListModel'),
bodyParser = require('body-parser');

app.use( bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() );
/* app.use(function(req, res, next ){
    res.status( 404 ).send({ url: req.originalUrl + ' not found'})
    next();
}); */

var routes = require('./api/routes/todoListRoutes'),
    cfdi_route = require('./api/routes/cfdiRouter');
//routes( app );
app.use('/api', routes );
app.use('/api', cfdi_route );


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Tododb', ( err, res )=>{
    app.listen( port, () => {
        console.log('todo list RESTful API started on: ' + port );
    });
});

