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

function saveUser( req, res ){
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
}

function uploadImage( req, res ){
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

        if( file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ){
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
}

function validaterequiredFields( fields, _interface ){
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
}

function fillInterface( params, _interface ){
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
}

module.exports   = {
    saveUser,
    uploadImage
};