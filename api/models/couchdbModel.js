// https://github.com/sevcsik/node-couchdb-model
// https://www.npmjs.com/package/node-couchdb
// https://www.npmjs.com/package/nano

var NodeCouchDb    = require('node-couchdb');
var nano    = require('nano');

const config     = require('../../config/config'),
      couchDb    = config.databases.couchdb,
      dbNames    = couchDb.dbnames,
      dbName     = dbNames.dbName,
      callback   = console.log();

function conexionNano(){
    var conexion    = nano( couchDb.host )
    .db
    .use( dbName );

    return conexion;
}

function conexionNodeCouch(){
    const conexion    = new NodeCouchDb({
        auth: couchDb.auth
        // host: couchDb.host,
        // protocol: 'http',
        // port: 5984
    });

    return conexion;
}

function getViews(){
    let conexion   = conexionNano()
        _nano      = nano( couchDb.host ),
        _views     = {};

    var query    = {
        "include_docs": false,
        "startkey": "_design",
        "endkey": "_design0"
    };
    // http://localhost:5984/zmpapelerias/_all_docs?startkey="_design"&endkey="%22"_design0"&include_docs=false
    conexion.list( query, function( err, body ){
        if( err ){
            console.log( err );
            return false;
        }
        body.rows.forEach( function( doc, field ){
            let opt   = {
                db: dbName,
                path: '/' + doc.id
            };
            var _view    = doc.id.split('/')[ 1 ];

            _nano // http://localhost:5984/zmpapelerias/_design/users
            .request( opt, function( error, data ){
                if( error ){
                    console.log( err );
                    return false;
                }
                for( var name in data.views ){
                    if( !_views.hasOwnProperty( _view ))
                        _views[ _view ]    = {};

                    if( !_views[ _view ].hasOwnProperty( name ))
                        _views[ _view ][ name ]    = {};

                    _views[ _view ][ name ]    = doc.id + '/' + name;
                }
            });
        });
    });

    return _views;
}

module.exports = {
    conexionNano,
    conexionNodeCouch,
    getViews
};

/*
// Funcion standart for views
function (doc) {
  if( doc.tipodedocumento && doc.tipodedocumento == 'user'){
    var item    = {};
    for( var field in doc ){
      var isChart = field.search('_');
      if( isChart == 0 ){
        // It does not anything.
      } else {
        item[ field ]   = doc[ field ];
      }
    }
    item.rev    = doc._rev;

    emit( doc._id, item );
    //emit( doc._id, {rev: doc._rev, username: doc.username, password: doc.password, email: doc.email, role: doc.role, active: doc.active});
  } else {
    // It does not a user type.
  }
}
*/