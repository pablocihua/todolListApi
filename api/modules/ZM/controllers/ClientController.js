'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

// Interfaces
var ClientI    = require('../models/interfaces/ClientInterface')();

// Models
const Models       = require('../models/ClientModel'),
      CouchDB      = require('../../acl/models/CouchdbModel'),
      couchNano    = CouchDB.conexionNano(),
      couchNode    = CouchDB.conexionNodeCouch(),
      ClientViews    = Models.ClientViews,
      // Configs
      config       = require('../../../../config/config');

// Services
var jwt    = require('../../acl/services/JwtService');
// Configs database.
const couchDb    = config.databases.couchdb,
      dbNames    = couchDb.dbnames,
      dbName     = dbNames.dbName,
// Configs extensions allowed
      lengths    = config.extensions_allowed.images
;

var ClientActions    = {
    saveClient: function( req, res ){
        // Final response.
        var response    = {
            title: 'Registro de Clientes',
            message: '',
            text: 'Ok',
        },
        _status    = 200;
        // Get request params.
        var params       = req.body;
        var _validate    = ClientActions.validaterequiredFields( params, ClientI );

        if( _validate.isValid ){
            var mangoQuery    = {
                "selector": {
                    "rfc": { "$eq": params.rfc },
                    "tipodedocumento": { "$eq": "client" }
                }
            };

            couchNode
            .mango( dbName, mangoQuery, {} )
            .then( ( data ) => {
                if( data.data.docs.length ){
                    res.status( _status ).send({
                        message: 'El cliente no puede registrarse.',
                        u: params
                    });
                } else {
                    // Encripting password
                    bcrypt.hash( params.password, null, null, ( err, hash ) => {
                        params.password = hash;
                        ClientI    = ClientActions.fillInterface( params, ClientI );

                        var ClientModel    = Models.Model.create( ClientI );
                        // Save Client in database.
                        ClientModel.save(( function( error ){
                            if( error ){
                                _status    = 500;
                                response.message    = 'Error al guardar el cliente';
                            } else {
                                _status    = 200;
                                response.message    = 'Se ha registrado el cliente';
                            }
                            res.status( _status ).send( response );
                        }));
                    });
                }
            },
            ( err ) => {
                res.status( 500 ).send({ message: 'Error al comprobar el cliente. ' + err })
            }
            );

            response.message    = 'Se ha registrado el cliente.';
            response.Client       = req.Client;
        } else {
            response.validate = _validate;
            response.message    = 'Error al validar los datos del cliente.';
            res.status( _status ).send( response );
        }
    },

    updateClient: function( req, res ){
        // Final response.
        var response    = {
            title: 'Actualización de Clientes',
            message: '',
            text: 'Ok',
        },
        _status    = 200;
        // Get request params.
        var params       = req.params,
            body         = req.body;

        let newClientI    = ClientI;

        let _validate    = ClientActions.validaterequiredFields( body, newClientI );
        if( _validate.isValid ){
            var mangoQuery    = {
                "selector": {
                    "_id": { "$eq": params.id },
                    "tipodedocumento": { "$eq": "client" }
                }
            };
            
            couchNode
            .mango( dbName, mangoQuery, {} )
            .then( ( data ) => {
                let _data    = data.data.docs;
                if( _data.length ){
                    _data    = _data[ 0 ];

                    ClientI    = ClientActions.fillInterface( body, _data );
                    couchNode
                    .update( dbName, ClientI )
                    .then(( saved ) => {
                        if( saved.data.ok ){
                            response.message    = 'Se ha actualizado el cliente';
                            response.Client       = ClientI;
                        } else {
                            response.message    = 'No se pudo actualizar el cliente';
                        }
                        res.status( _status ).send( response );
                    },
                    ( err ) => {
                        response.message    = 'Error al actualizar el cliente. ' + err;
                        res.status( 500 ).send( response )
                    });
                } else {
                    res.status( _status ).send({
                        message: 'El cliente no puede actualizarse.',
                        u: params
                    });
                }
            },
            ( err ) => {
                res.status( 500 ).send({ message: 'Error al comprobar el cliente. ' + err })
            }
            );
        } else {
            response.validate = _validate;
            response.message    = 'Error al validar el cliente.';
            res.status( _status ).send( response );
        }
    },

    uploadImage: function( req, res ){
        var ClientId       = req.params.id;
        var file_name    = 'No subido';
        // Final response.
        var response    = {
            title: 'Guarda Imagen',
            message: 'Se guardo la imagen del cliente!',
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
                couchNano.get( ClientId, function( err, doc ){
                    _status    = 200;
                    if( err ){
                        response.message    = 'No existe el registro';
                        res.status( _status ).send( response );
                    } else {
                        doc[ Image.fieldName ]    = file_name; // Update the file name.
                        // Updates the image's name.
                        couchNano
                        .insert( doc, ClientId,
                            function( _err, _res ){
                                if( _err ){
                                    _status    = 500;
                                    response.message    = "Error al actualizar el cliente";
                                    res.status( _status ).send( response );
                                } else {
                                    fs.readFile( file_path, ( err, attch ) => {
                                        if( err ){
                                            _status    = 500;
                                            response.message    = "Error al leer la imagen del cliente";
                                            res.status( _status ).send( response );
                                        } else {
                                            couchNano.get( ClientId, function( err, _doc ){
                                                couchNano
                                                .attachment
                                                .insert( ClientId, file_name, attch, contentType,
                                                    { rev: _doc._rev },
                                                    function( err, _body ){
                                                        if( err ){
                                                            _status    = 500;
                                                            response.message    = "Error al guardar la imagen del cliente";
                                                        } else {
                                                            // All finished well.
                                                            response.Client     = req.Client;
                                                            response.Client2    = doc;
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
                title: "Registro de Clientes",
                message: 'No se han subido archivos'
            });
        }
    },
    
    removeImage: function( req, res ){
        let params     = req.params,
            ClientId     = params.id,
            image      = params.imageFile,
            _status    = 200;
        // Final response.
        var response    = {
            title: 'Eliminar Imagen',
            message: 'Se eliminó la imagen del cliente!',
            text: 'Ok',
        };

        couchNano.get( ClientId, function( err, doc ){
            if( err ){
                response.message    = 'No existe el registro a remplazar';
                res.status( _status ).send( response );
            } else {
                if( doc.hasOwnProperty('_attachments')){
                    if( doc._attachments[ image ]){
                        couchNano.attachment.destroy(
                            ClientId,
                            image,
                            { rev: doc._rev },
                            function( er, rs ){
                                if( er ){
                                    _status    = 500;
                                    response.message    = "Error al borrar la imagen del cliente";
                                } else {
                                    // All finished well And continues the process.
                                }
                                res.status( _status ).send( response );
                            }
                        );
                    } else {
                        response.message    = "No existe imagen del cliente";
                        res.status( _status ).send( response );
                    }
                } else {
                    // It has'nt any attachement.
                    response.message    = "No existe la imagen del cliente";
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
                if(( _interface[ field ].hasOwnProperty('required') 
                    && !fields[ field ].length )){

                    if( typeof fields[ field ] === 'boolean' ){
                        // It does not add like a required.
                    } else {
                        _Result.fields.push({
                            name: field,
                            required: _interface[ field ].required || 'This field is required'
                        });
                    }
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

    getClients: function( req, res ){
        var params    = null,
            body      = null,
            keys      = null,
            _query    = {},
        // Final response.
            response    = {
                title: 'Lista de Clientes',
                text: 'Ok',
                message: 'Regresando el listado de Clientes',
                data: []
            },
            _status    = 200,
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
        _query.alive    = false;
        if( Object.keys( body ).length ){
            Object.keys( body ).forEach(( field ) => {
                _query[ field ]    = body[ field ];
            });
        } else {
            // It did not send any params in body.
            _query.skip    = 0;
        }

        couchNano
        .view( 'clients', 'all?descending=true', _query, ( error, data ) => { // &startkey=["true","alive"]&endkey=["true","alive"]
            console.log( error )
            var items         = [],
                _totalPage    = 1;

            if( data.total_rows > paging.perPage ){
                _totalPage    = parseInt( data.total_rows / paging.perPage );
                _totalPage    += ( data.total_rows % paging.perPage ) ? 1 : 0;
            } else {
                // The total rows is less or equal to perPage.
            }

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
                _status    = 200;
                response.message    = 'No existe información sobre Clientes!';
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

    searchClient: function( req, res ){
        // Final response.
        var response    = {
                title: 'Busqueda de Clientes',
                message: '',
                text: 'Ok',
            },
            _status    = 200,
        // Get request params.
            params    = req.body;

        var selector    = {
                "tipodedocumento": { "$eq": "client" },
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
                    message: 'El cliente no puede encontrarse.',
                    u: params,
                    data: []
                });
            }
        },
        ( err ) => {
            res.status( 500 ).send({ message: 'Error al comprobar el cliente. ' + err })
        }
        );
    }
}

module.exports    = ClientActions;