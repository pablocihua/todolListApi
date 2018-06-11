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
        var params       = req.body;
        var _validate    = UserActions.validaterequiredFields( params, UserI );
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
                        UserI    = UserActions.fillInterface( params, UserI );
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
            response.validate = _validate;
            response.message    = 'Error al validar el usuario.';
            res.status( _status ).send( response );
        }
    },

    updateUser: function( req, res ){
        // Final response.
        var response    = {
            title: 'Actualización de Usuarios',
            message: '',
            text: 'Ok',
        },
        _status    = 200;
        // Get request params.
        var params       = req.params,
            body         = req.body;

        let newUserI    = UserI;
        if( body.password.length ){
            // It has to encrypting the pass
        } else {
            delete newUserI.password
        }

        let _validate    = UserActions.validaterequiredFields( body, newUserI );
        if( _validate.isValid ){
            var mangoQuery    = {
                "selector": {
                    "_id": { "$eq": params.id },
                    "tipodedocumento": { "$eq": "user" }
                }
            };
            
            couchNode
            .mango( dbName, mangoQuery, {} )
            .then( ( data ) => {
                let _data    = data.data.docs;
                if( _data.length ){
                    let _passHash    = '';
                    _data         = _data[ 0 ];
                    // Encripting password in case it was changed.
                    _passHash     = ( body.password.length ) ? bcrypt.hashSync( body.password ) : '';
                    if( _passHash.length ){
                        _data.password    =_passHash;
                    } else {
                        // It keepers the same value.
                    }

                    UserI    = UserActions.fillInterface( body, _data );
                    console.log( UserI )
                    couchNode
                    .update( dbName, UserI )
                    .then(( saved ) => {
                        console.log( saved );
                        response.message    = 'Se ha actualizado el usuario';
                        response.user       = UserI;
                        res.status( _status ).send( response );
                    },
                    ( err ) => {
                        response.message    = 'Error al actualizar el usuario. ' + err;
                        res.status( 500 ).send( response )
                    });
                } else {
                    res.status( _status ).send({
                        message: 'El usuario no puede actualizarse.',
                        u: params
                    });
                }
            },
            ( err ) => {
                res.status( 500 ).send({ message: 'Error al comprobar el usuario. ' + err })
            }
            );
        } else {
            response.validate = _validate;
            response.message    = 'Error al validar el usuario.';
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

        if( Object.keys( req.files ).length ){
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
                        // file_name    = doc.email+"."+file_ext; // Name of the image.
                        doc[ Image.fieldName ]    = file_name; // Update the file name.

                        couchNano
                        .insert( doc, userId,
                            function( _err, _res ){
                                if( _err ){
                                    _status    = 500;
                                    response.message    = "Error al actualizar el usuario";
                                    res.status( _status ).send( response );
                                } else {
                                    fs.readFile( file_path, ( err, attch ) => {
                                        if( err ){
                                            _status    = 500;
                                            response.message    = "Error al leer la imagen del usuario";
                                            res.status( _status ).send( response );
                                        } else {
                                            couchNano.get( userId, function( err, _doc ){
                                                couchNano
                                                .attachment
                                                .insert( userId, file_name, attch, contentType,
                                                    { rev: _doc._rev },
                                                    function( err, _body ){
                                                        if( err ){
                                                            _status    = 500;
                                                            response.message    = "Error al guardar la imagen del usuario";
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
                text: "Ok",
                title: "Registro de Usuarios",
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
            if( _interface.hasOwnProperty( field )){
                if( _interface[ field ].hasOwnProperty('required') 
                && !fields[ field ].length ){
                    _Result.fields.push({
                        name: field,
                        required: _interface[ field ].required || 'This field is required'
                    });
                } else {
                    // The field has a value.
                }
            } else {
                // The field is not a property of object.
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
        var params    = null,
        keys          = null,
        _query        = {},
        // Final response.
        response    = {
            title: 'Lista de usuarios',
            text: 'Ok',
            message: 'Regresando el listado de usuarios',
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
        .view( 'users', 'all', _query, ( error, data ) => {
            var items    = [];
            data         = data["rows"];

            data.forEach( item => {
                var _item    = { id: item.id };
                _item        = Object.assign( _item, item.value );
                _item.key    =  item.key

                /* var img = couchNano.attachment
                    .get( _item.id, _item.image )
                    .pipe( fs.createWriteStream( _item.image )); */
                // if( _item.hasOwnProperty('attachments') ){
                /*    var img = couchNano.attachment
                        .get( _item.id, _item.image, ( err, body ) => {
                            fs.writeFileSync( _item.image, body );
                        });*/
// console.log( img );
//                     _item.image = img;
//                 }

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
    },

    getImageAttachment: function( req, res ){
        var id =  req.params.id;
        var imageFile =  req.params.imageFile;

        couchNano
        .attachment
        .get( id, imageFile )
        .pipe( res );
    }
}

module.exports    = UserActions;