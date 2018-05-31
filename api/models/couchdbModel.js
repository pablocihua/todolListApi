var NodeCouchDb    = require('node-couchdb');

const config    = require('../../config/config');

function conexionCouch(){
    var couchDb    = new NodeCouchDb({
        auth: config.databases.couchdb.auth
    });

    return couchDb;
}

module.exports = {
    conexionCouch
};