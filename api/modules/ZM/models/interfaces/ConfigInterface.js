module.exports = function(){
    return {
        "name": {
            "type": "string",
            "required": "Kindly enter the name of the configuration"
        },
        "description": {
            "type": "string",
            "required": "Kindly enter the rfc description the configuration"
        },
        "created_at": {
            "type": Date,
            "default": Date.now()
        },
        "created_by": {
            "type": "string",
            "default": "Systems"
        },
        "updated_at": {
            "type": Date,
            "default": Date.now()
        },
        "updated_by": {
            "type": "string",
            "default": "Systems"
        },
        "alive": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if configuration is alive"
        },
        "active": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if configuration is active"
        },
        "image": "",
        "tipodedocumento": "configuration"
    };
}