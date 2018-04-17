'use strict';

var fs = require('fs');
const Authentication = require('sw-sdk-nodejs').Authentication;
const StampService = require('sw-sdk-nodejs').StampService;

exports.cfdiTimbre = ( req, res ) => {
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