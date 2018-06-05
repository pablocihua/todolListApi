'use strict'

let permissions    = [];

function hasPermission( req, res, next ){
    console.log( req.url, req.originalUrl )
    let role   = req.user.role,
        isAllowed    = Object.keys( permissions ).filter(( ROLE, key ) => {
            let is
            console.log( ROLE )
        });
    /* Object.keys( permissions ).forEach( ( ROLE ) => {

    }); */
}

module.exports    = {
    hasPermission
};