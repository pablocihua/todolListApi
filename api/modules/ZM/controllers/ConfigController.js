'use strict'

// Modules
var bcrypt    = require('bcrypt-nodejs'),
    fs        = require('fs'),
    path      = require('path');

// Interfaces
var ConfigI    = require('../models/interfaces/ConfigInterface')();

// Models
const Models       = require('../models/CatalogModel'),
      CouchDB      = require('../../acl/models/CouchdbModel'),
      couchNano    = CouchDB.conexionNano(),
      couchNode    = CouchDB.conexionNodeCouch(),
    //   CatalogViews    = Models.CatalogViews,
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

var ConfigActions    = {
    saveConfig: function( req, res ){
        // Final response.
        var response    = {
            title: 'Registro de Catálogos',
            message: '',
            text: 'Ok',
        },
        _status    = 200;
        // Get request params.
        var params       = req.body;
        var _validate    = ConfigActions.validaterequiredFields( params, ConfigI );

        if( _validate.isValid ){
            var mangoQuery    = {
                "selector": {
                    "name": { "$eq": params.name },
                    "tipodedocumento": { "$eq": "catalog" }
                }
            };

            couchNode
            .mango( dbName, mangoQuery, {} )
            .then( ( data ) => {
                if( data.data.docs.length ){
                    res.status( _status ).send({
                        message: 'El catálogo no puede registrarse.',
                        u: params
                    });
                } else {
                    // Encripting password
                    bcrypt.hash( params.password, null, null, ( err, hash ) => {
                        params.password = hash;
                        ConfigI    = ConfigActions.fillInterface( params, ConfigI );

                        var ConfigModel    = Models.Model.create( ConfigI );
                        // Save Catalog in database.
                        ConfigModel.save(( function( error ){
                            if( error ){
                                _status    = 500;
                                response.message    = 'Error al guardar el catálogo';
                            } else {
                                _status    = 200;
                                response.message    = 'Se ha registrado el catálogo';
                            }
                            res.status( _status ).send( response );
                        }));
                    });
                }
            },
            ( err ) => {
                res.status( 500 ).send({ message: 'Error al comprobar el catálogo. ' + err })
            }
            );

            response.message    = 'Se ha registrado el catálogo.';
            response.Catalog       = req.Catalog;
        } else {
            response.validate = _validate;
            response.message    = 'Error al validar los datos del catálogo.';
            res.status( _status ).send( response );
        }
    },

    updateConfig: function( req, res ){
        // Final response.
        var response    = {
            title: 'Actualización de Catálogos',
            message: '',
            text: 'Ok',
        },
        _status    = 200;
        // Get request params.
        var params       = req.params,
            body         = req.body;

        let newConfigI    = ConfigI;

        let _validate    = CatalogActions.validaterequiredFields( body, newConfigI );
        if( _validate.isValid ){
            var mangoQuery    = {
                "selector": {
                    "_id": { "$eq": params.id },
                    "tipodedocumento": { "$eq": "catalog" }
                }
            };
            
            couchNode
            .mango( dbName, mangoQuery, {} )
            .then( ( data ) => {
                let _data    = data.data.docs;
                if( _data.length ){
                    _data    = _data[ 0 ];

                    ConfigI    = CatalogActions.fillInterface( body, _data );
                    couchNode
                    .update( dbName, ConfigI )
                    .then(( saved ) => {
                        if( saved.data.ok ){
                            response.message    = 'Se ha actualizado el cataloge';
                            response.Catalog       = ConfigI;
                        } else {
                            response.message    = 'No se pudo actualizar el cataloge';
                        }
                        res.status( _status ).send( response );
                    },
                    ( err ) => {
                        response.message    = 'Error al actualizar el cataloge. ' + err;
                        res.status( 500 ).send( response )
                    });
                } else {
                    res.status( _status ).send({
                        message: 'El cataloge no puede actualizarse.',
                        u: params
                    });
                }
            },
            ( err ) => {
                res.status( 500 ).send({ message: 'Error al comprobar el cataloge. ' + err })
            }
            );
        } else {
            response.validate = _validate;
            response.message    = 'Error al validar el cataloge.';
            res.status( _status ).send( response );
        }
    },

    uploadImage: function( req, res ){
        var ConfigId       = req.params.id;
        var file_name    = 'No subido';
        // Final response.
        var response    = {
            title: 'Guarda Imagen',
            message: 'Se guardo la imagen del cataloge!',
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
                couchNano.get( ConfigId, function( err, doc ){
                    _status    = 200;
                    if( err ){
                        response.message    = 'No existe el registro';
                        res.status( _status ).send( response );
                    } else {
                        doc[ Image.fieldName ]    = file_name; // Update the file name.
                        // Updates the image's name.
                        couchNano
                        .insert( doc, ConfigId,
                            function( _err, _res ){
                                if( _err ){
                                    _status    = 500;
                                    response.message    = "Error al actualizar el cataloge";
                                    res.status( _status ).send( response );
                                } else {
                                    fs.readFile( file_path, ( err, attch ) => {
                                        if( err ){
                                            _status    = 500;
                                            response.message    = "Error al leer la imagen del cataloge";
                                            res.status( _status ).send( response );
                                        } else {
                                            couchNano.get( ConfigId, function( err, _doc ){
                                                couchNano
                                                .attachment
                                                .insert( ConfigId, file_name, attch, contentType,
                                                    { rev: _doc._rev },
                                                    function( err, _body ){
                                                        if( err ){
                                                            _status    = 500;
                                                            response.message    = "Error al guardar la imagen del cataloge";
                                                        } else {
                                                            // All finished well.
                                                            response.Catalog     = req.Catalog;
                                                            response.Catalog2    = doc;
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
                title: "Registro de Catálogos",
                message: 'No se han subido archivos'
            });
        }
    },
    
    removeImage: function( req, res ){
        let params     = req.params,
            ConfigId     = params.id,
            image      = params.imageFile,
            _status    = 200;
        // Final response.
        var response    = {
            title: 'Eliminar Imagen',
            message: 'Se eliminó la imagen del cataloge!',
            text: 'Ok',
        };

        couchNano.get( ConfigId, function( err, doc ){
            if( err ){
                response.message    = 'No existe el registro a remplazar';
                res.status( _status ).send( response );
            } else {
                if( doc.hasOwnProperty('_attachments')){
                    if( doc._attachments[ image ]){
                        couchNano.attachment.destroy(
                            ConfigId,
                            image,
                            { rev: doc._rev },
                            function( er, rs ){
                                if( er ){
                                    _status    = 500;
                                    response.message    = "Error al borrar la imagen del cataloge";
                                } else {
                                    // All finished well And continues the process.
                                }
                                res.status( _status ).send( response );
                            }
                        );
                    } else {
                        response.message    = "No existe imagen del cataloge";
                        res.status( _status ).send( response );
                    }
                } else {
                    // It has'nt any attachement.
                    response.message    = "No existe la imagen del cataloge";
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

    getConfigs: function( req, res ){
        var params    = null,
            body      = null,
            keys      = null,
            _query    = {},
        // Final response.
            response    = {
                title: 'Lista de Catálogos',
                text: 'Ok',
                message: 'Regresando el listado de Catálogos',
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
        .view( 'config', 'all?descending=true', _query, ( error, data ) => { // &startkey=["true","alive"]&endkey=["true","alive"]
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
                response.message    = 'No existe información sobre Catálogos!';
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

    searchConfig: function( req, res ){
        // Final response.
        var response    = {
                title: 'Busqueda de Catálogos',
                message: '',
                text: 'Ok',
            },
            _status    = 200,
        // Get request params.
            params    = req.body;

        var selector    = {
                "tipodedocumento": { "$eq": "catalog" },
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
                    message: 'El cataloge no puede encontrarse.',
                    u: params,
                    data: []
                });
            }
        },
        ( err ) => {
            res.status( 500 ).send({ message: 'Error al comprobar el cataloge. ' + err })
        }
        );
    }
}

module.exports    = ConfigActions;