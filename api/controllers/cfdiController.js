'use strict';

var fs = require('fs'),
multer = require('multer');

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
        var file_name = file_split[ 2 ];

        //var ext_split = file_name.split('.');
        //var file_ext = ext_split[ 1 ];

        //if( file_ext == 'xml' ){

            res.status( 200 ).send({
                file_path : file_path,
                file_split:  file_split,
                file_name : file_name
            });
        /*} else {
            fs.unlink( file_path, ( err ) => {
                if( err ){
                    res.status( 200 ).send({ message: 'Extención no valida y fichero no borrado'});
                } else 
                    res.status( 200 ).send({ message: 'Extención no valida'});
            });
        }*/
    }  else {
        res.status( 200 ).send({
            message: 'No se han subido archivos'
        });
    }
}

module.exports = {
    cfdiTimbre,
    uploadXml
}