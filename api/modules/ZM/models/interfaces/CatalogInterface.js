module.exports = function(){
    return {
        "name": {
            "type": "String",
            "required": "Kindly enter the name of the catalog"
        },
        "description": {
            "type": "String",
            "required": "Kindly enter the rfc description the catalog"
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
            "required": "Kindly enter if catalog is alive"
        },
        "active": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if catalog is active"
        },
        "image": "",
        "tipodedocumento": "catalog"
    };
}