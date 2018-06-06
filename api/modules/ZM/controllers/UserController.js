'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

// Interfaces
var UserI    = require('../models/interfaces/UserInterface')();

// Models
const Models       = require('../models/UserModel'),
      CouchDB      = require('../../acl/models/CouchdbModel'),
      couchNano    = CouchDB.conexionNano(),
      couchNode    = CouchDB.conexionNodeCouch(),
      UserViews    = Models.UserViews,
      // Configs
      config       = require('../../../../config/config');

// Services
var jwt    = require('../../acl/services/JwtService');
// Configs database.
const couchDb    = config.databases.couchdb,
      dbNames    = couchDb.dbnames,
      dbName     = dbNames.dbName,
      viewUrl    = dbNames.views.users.by_email,
// Configs extensions allowed
      lengths    = config.extensions_allowed.images
;

var UserActions    = {
    saveUser: function( req, res ){
        // Final response.
        var response    = {
            title: 'Registro de Usuarios',
            message: '',
            text: 'Ok',
        },
        _status    = 200;
        // Get request params.
        var    params    = req.body;
        var _validate    = validaterequiredFields( params, UserI );
        if( _validate.isValid ){
            var mangoQuery    = {
                "selector": {
                    "email": { "$eq": params.email.toLowerCase() },
                    "tipodedocumento": { "$eq": "user" }
                }
            };

            couchNode
            .mango( dbName, mangoQuery, {} )
            .then( ( data ) => {
                if( data.data.docs.length ){
                    res.status( _status ).send({
                        message: 'El usuario no puede registrarse.',
                        u: params
                    });
                } else {
                    // Encripting password
                    bcrypt.hash( params.password, null, null, ( err, hash ) => {
                        params.password = hash;
                        UserI    = fillInterface( params, UserI );
                        var UserModel    = Models.Model.create( UserI );
                        // Save user in database.
                        UserModel.save(( function( error ){
                            if( error ){
                                _status    = 500;
                                response.message    = 'Error al guardar el usuario';
                            } else {
                                _status    = 200;
                                response.message    = 'Se ha registrado el usuario';
                                response.user       = UserModel;
                            }
                            res.status( _status ).send( response );
                        }));
                    });
                }
            },
            ( err ) => {
                res.status( 500 ).send({ message: 'Error al comprobar el usuario. ' + err })
            }
            );

            response.message    = 'Se ha registrado el usuario.';
            response.user       = req.user;
        } else {
            response.message    = 'El usuario no puede registrarse.';
            res.status( _status ).send( response );
        }
    },

    uploadImage: function( req, res ){
        var userId       = req.params.id;
        var file_name    = 'No subido';
        // Final response.
        var response    = {
            title: 'Guarda Imagen',
            message: 'Se guardo la imagen del usuario!',
            text: 'Ok',
        },
        _status    = 200;

        if( req.files ){
            var Image         = req.files.image,
                contentType   = Image.type,
                file_path     = Image.path,
                file_split    = file_path.split('\\'),
                file_split    = file_path.split('/'),
                file_name     = file_split[ file_split.length -1 ],
                ext_split     = file_name.split('.'),
                file_ext      = ext_split[ 1 ];

            let allowed   = lengths.filter( obj => {
                return obj.name == file_ext && obj.active === true
            });
            if( allowed.length ){
                couchNano.get( userId, function( err, doc ){
                    _status    = 200;
                    if( err ){
                        response.message    = 'No existe el registro';
                        res.status( _status ).send( response );
                    } else {
                        file_name    = doc.email+"."+file_ext; // Name of the image.
                        doc[ Image.fieldName ]    = file_name; // Update the file name.

                        couchNano
                        .insert( doc, userId,
                            function( _err, _res ){
                                if( _err ){
                                    _status    = 500;
                                    response.message    = "Error al actualizar el usuario";
                                    res.status( _status ).send( response );
                                } else {
                                    couchNano.get( userId, function( err, _doc ){
                                        couchNano
                                        .attachment
                                        .insert( userId, file_name, req.file, contentType,
                                            { rev: _doc._rev },
                                            function( err, _body ){
                                                if( err ){
                                                    _status    = 500;
                                                    response.message    = "Error al actualizar el usuario";
                                                } else {
                                                    // All finished well.
                                                    response.user     = req.user;
                                                    response.user2    = doc;
                                                }
                                                // console.log( response )
                                                fs.unlinkSync( file_path );
                                                res.status( _status ).send( response );
                                            }
                                        );
                                    });
                                }
                            });
                    }
                });
            } else {
                fs.unlink( file_path, ( err ) => {
                    if( err ){
                        res.status( 200 ).send({ message: 'Extención no valida y fichero no borrado'});
                    } else {
                        res.status( 200 ).send({ message: 'Extención no valida'});
                    }
                });
            }
        } else {
            res.status( 200 ).send({
                message: 'No se han subido archivos'
            });
        }
    },

    validaterequiredFields: function( fields, _interface ){
        var _Result   = {
            isValid: true,
            fields: []
        };

        Object.keys( fields ).forEach(( field, position ) => {
            if( _interface[ field ].hasOwnProperty('required') && !fields[ field ].length ){
                _Result.fields.push({
                    name: field,
                    required: _interface[ field ].required || 'This field is required'
                });
            } else {
                // The field has a value.
            }
        });

        _Result.isValid    = _Result.isValid && !_Result.fields.length;

        return _Result;
    },

    fillInterface: function( params, _interface ){
        Object.keys( params ).forEach(( field ) => {
            if( _interface.hasOwnProperty( field )){
                _interface[ field ]    = params[ field ];
            } else {
                // It does not add any value.
            }
        });
        Object.keys( _interface ).forEach(( field ) => {
            if( _interface[ field ].hasOwnProperty('default')){
                _interface[ field ]    = _interface[ field ].default;
            } else {
                // It haven't defaul value.
            }
        });

        return _interface;
    },

    getUsers: function( req, res ){
        var params    = req.params,
        keys          = params.id,
        _query        = {},
        // Final response.
        response    = {
            title: 'Lista de usuarios',
            text: 'Ok',
            message: 'Regresando el listado de usuarios',
            data: []
        },
        _status    = 200;

        if( keys.length > 1 && keys != '0' ){
            _query.keys    = [ keys ];
        } else {
            // Does not sent any params.
        }

        couchNano
        .view( 'acl', 'usuarios', _query, ( error, data ) => {
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
                response.message    = 'No existe información sobre usuarios!';
            }
            res.status( _status ).send( response );
        });
    }
}

module.exports    = UserActions;