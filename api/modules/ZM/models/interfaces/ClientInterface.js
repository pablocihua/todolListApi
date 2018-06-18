module.exports = function(){
    return {
        "name": {
            "type": "String",
            "required": "Kindly enter the name of the client"
        },
        "rfc": {
            "type": "String",
            "required": "Kindly enter the rfc of the client"
        },
        "tel": {
            "type": "String",
            "required": "Kindly enter the tel of the client"
        },
        "created_at": {
            "type": Date,
            "default": Date.now()
        },
        "created_by": {
            "type": "String",
            "default": "Systems"
        },
        "updated_at": {
            "type": Date,
            "default": Date.now()
        },
        "updated_by": {
            "type": "String",
            "default": "Systems"
        },
        "alive": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if client is alive"
        },
        "active": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if client is active"
        },
        "image": "",
        "tipodedocumento": "client"
    };
}