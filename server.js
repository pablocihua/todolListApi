
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

app.use(function(req, res, next) { //allow cross origin requests

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Accept-Control-Allow-Request-Method');
    res.header('Access-control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    //res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    //res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    res.header("Access-Control-Allow-Credentials", true);
    next();
});
//routes( app );
app.use('/api', routes );
app.use('/api', cfdi_route );


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Tododb', ( err, res )=>{
    app.listen( port, () => {
        console.log('todo list RESTful API started on: ' + port );
    });
});
