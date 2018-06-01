// var NodeCouchDb    = require('node-couchdb');
var nano    = require('nano');

const config    = require('../../config/config');

function conexionCouch(){
    /* var couchDb    = new NodeCouchDb({
        auth: config.databases.couchdb.auth
    }); */

    const couchDb    = config.databases.couchdb,
    dbNames    = couchDb.dbnames,
    dbName     = dbNames.dbName,
    viewUrl    = dbNames.views.users.by_email;

    var conexion    = nano( couchDb.host )
    .db
    .use( dbName );

    return conexion;
}

module.exports = {
    conexionCouch
};