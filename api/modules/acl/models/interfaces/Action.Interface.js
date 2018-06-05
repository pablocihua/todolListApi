module.exports = function(){
    return {
        "name": {
            "type": "String",
            "required": "Kindly enter the name of the Action"
        },
        "alias": {
            "type": "String",
            "required": "Kindly enter the alias of the Action"
        },

        "created_at": {
            "type": Date,
            "default": Date.now()
        },
        "created_by": {
            "type": "System",
            "required": "Kindly enter the Action who made the record"
        },
        "updated_at": {
            "type": Date.now()
        },
        "updated_by": {
            "type": "System",
            "required": "Kindly enter the Action who updated the record"
        },
        "alive": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Action is alive"
        },
        "active": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Action is active"
        },
        "tipodedocumento": "action"
    };
}