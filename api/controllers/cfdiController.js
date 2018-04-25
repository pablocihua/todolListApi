'use strict';

var fs = require('fs'),
multer = require('multer'),
parserXmltoJson = require('xml2json');

const Authentication = require('sw-sdk-nodejs').Authentication;
const StampService = require('sw-sdk-nodejs').StampService;
// Does not work
function uploadXml_1( req, res ){
    console.log( req.files );
    var storage = multer.diskStorage({
        destination: function( req, file, cb ){
            cb( null, './data/');
        },
        filename: function( req, file, cb ){
            console.log( file )
            var datetimestamp = Date.now();
            cb( null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1 ]);
        }
    });

    var upload = multer({ // multer settings
        storage: storage
    }).single('file');

    upload( req, res, function( err ){
        console.log( req.file );
        if( err ){
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        res.json({ error_code: 0, err_desc: null });
    })
}

function cfdiTimbre( req, res ){
    let obj = {
        url : "http://services.test.sw.com.mx",
        user: "demo",
        password: "123456789",
    }

    //let auth = Authentication.auth(obj);

    let callback = ( err, data ) => {
        if(err) {
            console.log(err)
        } else{
            console.log(data)
        }
    };

    // auth.Token(callback);
    fs.readFile('./data/cfdi.xml', 'utf8',
    function(err, contents) {
        if(err) {
            let errRes = {
                status: 'error',
                message: err.message,
                messageDetail: err.message
            }
            console.log(errRes);
        } else {            
            let xml = contents;
            let stamp = StampService.Set( obj );
            stamp.StampV3( xml, callback );
        }
    });
    
    res.status( 200 ).send({
        message: 'Test cdfi controller'
    });
}

function uploadXml( req, res ){
    console.log( req.files );
    if( req.files ){
        var file_path = req.files.xml.path;
        var file_split = file_path.split('\\');
        var file_split = file_path.split('/');
        var file_name = file_split[ 1 ],
            _path     = file_split[ 0 ],
            body      = req.body;

        var ext_split = file_name.split('.');
        var file_ext = ext_split[ 1 ];
//console.log( file_name, file_path, file_split, ext_split, body )
        var newname = './'+ _path +'/'+ 
            body.client +'_'+
            body.rfc +'_'+ 
            body.date + '.xml';
        if( file_ext == 'xml' || req.files.hasOwnProperty('xml') ){
            fs.renameSync( './'+ file_path, newname );

            var response    = {
                file_path : file_path,
                file_split: file_split,
                file_name : file_name,
                newname: newname
            };
            if( fs.existsSync( newname )){
                var _xmlFile    = fs.readFileSync( newname, "utf8" ),
                _jsonXml    = parserXmltoJson
                    .toJson( _xmlFile, { object: true, reversible: true });

                let sXml    = Object.assign( {}, _jsonXml["cfdi:Comprobante"] );
                delete sXml['xmlns:cfdi'];
                delete sXml['xmlns:xsi'];
                delete sXml['xsi:schemaLocation'];
                delete sXml['Certificado'];
                delete sXml['Sello'];

                sXml   = getOriginalString( sXml ) + '||';
                console.log( sXml );
                //processXmlFile( _jsonXml );
                response.status    = 200;
            } else {
                response.status    = 401;
            }

            res.status( response.status ).send( response );
        } else {
            fs.unlink( file_path, ( err ) => {
                if( err ){
                    res.status( 200 ).send({ message: 'Extención no valida y fichero no borrado'});
                } else 
                    res.status( 200 ).send({ message: 'Extención no valida'});
            });
        }
    }  else {
        res.status( 200 ).send({
            message: 'No se han subido archivos'
        });
    }
}

function processXmlFile( ){
    console.log('File Renamed.', err );
    
    return;
}

function getOriginalString( xmlJson, originalString = '|' ){
    // originalString    = originalname || '|';
    Object.keys( xmlJson )
    .forEach(( index, i ) => {
        if( typeof xmlJson[ index ] === "object"){
            //console.log( index, typeof xmlJson[ index ] );
            originalString    = getOriginalString( xmlJson[ index ], originalString );
        } else {
            originalString    += "|"+ xmlJson[ index ];
        }
    });

    return originalString;
}

module.exports = {
    cfdiTimbre,
    uploadXml
}