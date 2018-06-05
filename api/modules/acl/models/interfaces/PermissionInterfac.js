module.exports = function(){
    return {
        "name": {
            "type": "String",
            "required": "Kindly enter the name of the Permission"
        },
        "action": {
            "type": "String",
            "required": "Kindly enter the action of the Permission"
        },
        "controller": {
            "type": "String",
            "required": "Kindly enter the controller of the Permission"
        },
        "role": {
            "type": "String",
            "required": "Kindly enter the role of the Permission"
        },
        "inherit": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Permission is inherit"
        },

        "created_at": {
            "type": Date,
            "default": Date.now()
        },
        "created_by": {
            "type": "System",
            "required": "Kindly enter the Permission who made the record"
        },
        "updated_at": {
            "type": Date.now()
        },
        "updated_by": {
            "type": "System",
            "required": "Kindly enter the Permission who updated the record"
        },
        "alive": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Permission is alive"
        },
        "active": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Permission is active"
        },
        "tipodedocumento": "permission"
    };
}