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

const couchDb    = config.databases.couchdb,
      dbNames    = couchDb.dbnames,
      dbName     = dbNames.dbName,
      viewUrl    = dbNames.views.users.by_email;

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
        // console.log( UserViews )
        /* var first = { startkey: params.email },
        seconds = {{{ endkey: params.email }, sort: 'asc'}, skip: 0};
        UserViews.findOneByEmail( first, seconds, function( error, result ){
            if( error ){ res.status( 401 ).send({ message: error }) };
            console.log( error, result )
            return result;
        }); */

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
        title: 'Adjunta Imagen',
        message: '',
        text: 'Ok',
    },
    _status    = 200;
// console.log( req.body, req.params, req.user );
    if( req.files ){
        var file_path     = req.files.image.path;
        var file_split    = file_path.split('\\');
        var file_split    = file_path.split('/');
        var file_name     = file_split[ file_split.length -1 ];

        var ext_split    = file_name.split('.');
        var file_ext     = ext_split[ 1 ];
// console.log( file_ext, file_path, file_name, ext_split[ 0 ] )
        if( file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ){
            // if( userId != req.user.sub ){
            //     res.status( 500 ).send({ message: 'No tienes permiso para actualizar imagen'});
            // } else {
                // The user it haven't permission.
                couchNano.list({ startkey: userId, endkey: userId  }, function( err, body ){
                    _status    = 200;
                    if( err ){
                        response.message    = 'No existe el registro';
                        res.status( _status ).send( response );
                    } else {
                        response.message    = 'Operación exitosa!';
                        response.user       = req.user;
                        response.user2       = body.rows[ 0 ];
                        if( body.rows.length ){
                            body.rows.forEach( row => {
                                // bcrypt.compare( userId, row.value.rev, ( err, check ) => {
                                    console.log( userId,row.value.rev );
                                    // if( check ){
                                        couchNano
                                        .attachment
                                        .insert( 'image', file_name, req.file, 'image/png',
                                            { rev: row.value.rev },
                                            function( err, _body ){
                                                if( !err )
                                                    console.log( _body );
                                            });
                                        res.status( _status ).send( response );
                                        console.log( row )
                                    //} else {
                                    //    response.message    = 'No existe el registro';
                                    //    res.status( _status ).send( response );
                                    //}
                                // });
                            });
                        }
                    }
                });
                //couchNano.attachment();
            // }
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