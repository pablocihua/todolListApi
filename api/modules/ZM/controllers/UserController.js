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
                        body.password    = _passHash;
                    } else {
                        // It keepers the same value.
                        delete body.password;
                    }

                    UserI    = UserActions.fillInterface( body, _data );
                    couchNode
                    .update( dbName, UserI )
                    .then(( saved ) => {
                        if( saved.data.ok ){
                            response.message    = 'Se ha actualizado el usuario';
                            response.user       = UserI;
                        } else {
                            response.message    = 'No se pudo actualizar el usuario';
                        }
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
                        doc[ Image.fieldName ]    = file_name; // Update the file name.
                        // Updates the image's name.
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
    
    removeImage: function( req, res ){
        let params     = req.params,
            userId     = params.id,
            image      = params.imageFile,
            _status    = 200;
        // Final response.
        var response    = {
            title: 'Eliminar Imagen',
            message: 'Se eliminó la imagen del usuario!',
            text: 'Ok',
        };

        couchNano.get( userId, function( err, doc ){
            if( err ){
                response.message    = 'No existe el registro a remplazar';
                res.status( _status ).send( response );
            } else {
                if( doc.hasOwnProperty('_attachments')){
                    if( doc._attachments[ image ]){
                        couchNano.attachment.destroy(
                            userId,
                            image,
                            { rev: doc._rev },
                            function( er, rs ){
                                if( er ){
                                    _status    = 500;
                                    response.message    = "Error al borrar la imagen del usuario";
                                } else {
                                    // All finished well And continues the process.
                                }
                                res.status( _status ).send( response );
                            }
                        );
                    } else {
                        response.message    = "No existe imagen del usuario";
                        res.status( _status ).send( response );
                    }
                } else {
                    // It has'nt any attachement.
                    response.message    = "No existe la imagen del usuario";
                    res.status( _status ).send( response );
                }
            }
        });
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
            body      = null,
            keys      = null,
            _query    = {},
        // Final response.
            response    = {
                title: 'Lista de usuarios',
                text: 'Ok',
                message: 'Regresando el listado de usuarios',
                data: []
            },
            _status    = 200,
            items      = new Array,
            paging     = config.pagination;

        body      = ( req && req.hasOwnProperty('body'  )) ? req.body   : [];
        params    = ( req && req.hasOwnProperty('params')) ? req.params : [];
        keys      = ( params && params.hasOwnProperty('id')) ? params.id : [];

        if( keys.length > 1 && keys != '0' ){
            _query.keys    = [ keys ];
        } else {
            // Does not sent any params.
        }

        _query.limit    = paging.perPage;
        if( Object.keys( body ).length ){
            Object.keys( body ).forEach(( field ) => {
                _query[ field ]    = body[ field ];
            });
        } else {
            // It did not send any params in body.
            _query.skip    = 0;
        }

        couchNano
        .view( 'users', 'all', _query, ( error, data ) => {
            console.log( data, ( data.total_rows % 2 ) )
            var items        = [],
                _totalPage   = parseInt( data.total_rows / paging.perPage );

            _totalPage    += ( data.total_rows % 2 ) ? 1 : 0;
            response.totalData    = data.total_rows;
            response.totalPage    = _totalPage;
            response.perPage      = paging.perPage;
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
    },

    searchUser: function( req, res ){
        // Final response.
        var response    = {
                title: 'Busqueda de Usuarios',
                message: '',
                text: 'Ok',
            },
            _status    = 200,
        // Get request params.
            params    = req.body;

        var selector    = {
                "tipodedocumento": { "$eq": "user" },
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
            //sort.push( _fieldSort ); // It does not works, maybe the instruction it does not well.
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
                    message: 'El usuario no puede encontrarse.',
                    u: params,
                    data: []
                });
            }
        },
        ( err ) => {
            res.status( 500 ).send({ message: 'Error al comprobar el usuario. ' + err })
        }
        );
    },
// Intenté mejorar el metódo para reutilizarlo, pero no funcionó el 'SORT'.
    getUsers2: function( req, res ){
        // Final response.
        var response    = {
                title: 'Lista de Usuarios',
                message: '',
                text: 'Ok',
            },
            userId     = null,
            _status    = 200,
        // Get request params.
        params    = ( req && req.hasOwnProperty('params')) ? req.params : [];
        userId    = ( params && params.hasOwnProperty('id')) ? params.id : [];

        var selector    = {
                "tipodedocumento": { "$eq": "user" },
                //"name": { "$regex": "(?i)" },
                "$or": []
            },
            sort    = [],
            mangoQuery    = {
                "selector": selector,
                //"fields": ["name","surname","email","role","username"],
                //"sort": sort,
                "limit": 5,
                "skip": 5
            };

        if( userId > 0 ){
            Object.keys( params ).forEach(( val ) => {
                let regex         = {},
                    _fieldSort    = {};
                regex[ val ]      = {"$regex": "(?i)"+params[ val ]};
                _fieldSort[ val ] = "desc";
                selector["$or"].push( regex );
                sort.push( _fieldSort );

            });
        } else {
            // Doesn't exist params.
            delete selector.$or;
            //sort.push({"name": "asc"})
        }

        mangoQuery.selector    = Object.assign( mangoQuery.selector, selector );
        mangoQuery.sort        = sort; //Object.assign( mangoQuery.sort,     sort     );
console.log( mangoQuery )
        couchNode
        .mango( dbName, mangoQuery, {} )
        .then( ( data ) => {
            console.log( data )
            let _data    = data.data.docs;
            if( _data.length ){
                response.data    = _data;

                res.status( _status ).send( response );
            } else {
                res.status( _status ).send({
                    message: 'El usuario no puede encontrarse.',
                    u: params,
                    data: []
                });
            }
        },
        ( err ) => {
            res.status( 500 ).send( err )
        }
        );
    }
}

module.exports    = UserActions;