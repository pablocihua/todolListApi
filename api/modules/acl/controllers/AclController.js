'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');
// Loads configs and conects Db.
const config     = require('../../../../config/config'),
      CouchDB    = require('../models/CouchdbModel'),
      couchNano    = CouchDB.conexionNano(),
      couchNode    = CouchDB.conexionNodeCouch();

// Service jwt
var jwt    = require('../services/JwtService');
// Call to config database.
const couchDb    = config.databases.couchdb,
      dbNames    = couchDb.dbnames,
      dbName     = dbNames.dbName;

// Actions
var aclActions    = {

    index: function( req, res ){
        res.status( 200 ).send({
            message: 'Test Acl controller test method.'
        });
    },

    getActions: function( req, res ){
        var params    = req.params,
        keys          = params.id,
        _query        = {},
        // Final response.
        response    = {
            title: 'Lista de acciones',
            text: 'Ok',
            message: 'Regresando el listado de acciones',
            data: []
        },
        _status    = 200;

        if( keys.length > 1 && keys != '0' ){
            _query.keys    = [ keys ];
        } else {
            // Does not sent any params.
        }

        couchNano
        .view( 'acl', 'actions', _query, ( error, data ) => {
            var actions   = [];
            data    = data["rows"];

            data.forEach( action => {
                var _action    = { id: action.id };
                _action        = Object.assign( _action, action.value );
                _action.key    =  action.key

                actions.push( _action );
            });

            if( actions.length ){
                _status    = 200;
                response.data    = actions;
            } else {
                _status     = 404;
                response.message    = 'No existe información sobre acciones!';
            }
            res.status( _status ).send( response );
        });
    },

    getRoles: function( req, res ){
        var params    = req.params,
            keys      = params.id,
            _query    = {},
        // Final response.
            response    = {
                title: 'Lista de roles',
                text: 'Ok',
                message: 'Regresando el listado de roles',
                data: []
            },
            _status    = 200;

        if( keys.length > 1 && keys != '0' ){
            _query.keys    = [ keys ];
        } else {
            // Does not sent any params.
        }

        couchNano
        .view( 'acl', 'roles', _query, ( error, data ) => {
            var items    = [];
            data         = data["rows"];

            data.forEach( item => {
                var _item    = { id: item.id };
                _item        = Object.assign( _item, item.value );
                _item.key    =  item.key

                items.push( _item );
            });

            if( items.length ){
                _status    = 200;
                response.data    = items;
            } else {
                _status     = 404;
                response.message    = 'No existe información sobre roles!';
            }
            res.status( _status ).send( response );
        });
    },

    getControllers: function( req, res ){
        var params    = req.params,
        keys          = params.id,
        _query        = {},
        // Final response.
        response    = {
            title: 'Lista de controllers',
            text: 'Ok',
            message: 'Regresando el listado de controllers',
            data: []
        },
        _status    = 200;

        if( keys.length > 1 && keys != '0' ){
            _query.keys    = [ keys ];
        } else {
            // Does not sent any params.
        }

        couchNano
        .view( 'acl', 'controllers', _query, ( error, data ) => {
            var items    = [];
            data         = data["rows"];

            data.forEach( item => {
                var _item    = { id: item.id };
                _item        = Object.assign( _item, item.value );
                _item.key    =  item.key

                items.push( _item );
            });

            if( items.length ){
                _status    = 200;
                response.data    = items;
            } else {
                _status     = 404;
                response.message    = 'No existe información sobre controllers!';
            }
            res.status( _status ).send( response );
        });
    },

    getPermissions: function( req, res ){
        var params    = null,
        keys          = null,
        _query        = {},
        // Final response.
        response    = {
            title: 'Lista de permissions',
            text: 'Ok',
            message: 'Regresando el listado de permissions',
            data: []
        },
        _status    = 200,
        items      = [];

        params    = ( req && req.hasOwnProperty('params')) ? req.params : [];
        keys      = ( params && params.hasOwnProperty('id')) ? params.id : [];

        if( keys.length > 1 && keys != '0' ){
            _query.keys    = [ keys ];
        } else {
            // Does not sent any params.
        }

        couchNano
        .view( 'acl', 'permissions', _query, ( error, data ) => {
            data    = data["rows"];

            data.forEach( item => {
                var _item    = { id: item.id };
                _item        = Object.assign( _item, item.value );
                _item.key    =  item.key

                items.push( _item );
            });

            if( items.length ){
                _status    = 200;
                response.data    = items;
            } else {
                _status     = 404;
                response.message    = 'No existe información sobre permissions!';
            }

            if( res )
                res.status( _status ).send( response );
            else
                return items;
        });
    },

    searchItem: function( req, res ){
        // Get request params.
        var params    = req.body,
        // Final response.
            response    = {
                title: 'Busqueda de ' + params.doctype,
                message: '',
                text: 'Ok',
            },
            _status    = 200
        ;

        var selector    = {
                "tipodedocumento": { "$eq": params.doctype },
                "$or": []
            },
            sort    = [],
            mangoQuery    = {
                "selector": selector,
                "sort": sort
            };

        Object.keys( params ).forEach(( val ) => {
            let regex         = {},
                _fieldSort    = {};
            regex[ val ]      = {"$regex": "(?i)"+params[ val ]};
            _fieldSort[ val ] = "desc";
            selector["$or"].push( regex );
        });

        mangoQuery.selector    = Object.assign( mangoQuery.selector, selector );

        couchNode
        .mango( dbName, mangoQuery, {} )
        .then( ( data ) => {
            let _data    = data.data.docs;
            if( _data.length ){
                response.data    = _data;

                res.status( _status ).send( response );
            } else {
                res.status( _status ).send({
                    message: 'El '+ params.doctype +' no se encuentra.',
                    u: params,
                    data: []
                });
            }
        },
        ( err ) => {
            res.status( 500 ).send({ message: 'Error al comprobar el '+ params.doctype +'. ' + err })
        }
        );
    }
}

function getPermissions(){
    // items

    return items;
}

module.exports    = aclActions;