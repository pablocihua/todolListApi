module.exports = function(){
    return {
        "name": {
            "type": "String",
            "required": "Kindly enter the name of the Role"
        },
        "alias": {
            "type": "String",
            "required": "Kindly enter the alias of the Role"
        },

        "created_at": {
            "type": Date,
            "default": Date.now()
        },
        "created_by": {
            "type": "System",
            "required": "Kindly enter the Role who made the record"
        },
        "updated_at": {
            "type": Date.now()
        },
        "updated_by": {
            "type": "System",
            "required": "Kindly enter the Role who updated the record"
        },
        "alive": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Role is alive"
        },
        "active": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Role is active"
        },
        "tipodedocumento": "role"
    };
}