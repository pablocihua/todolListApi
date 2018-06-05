module.exports = function(){
    return {
        "name": {
            "type": "String",
            "required": "Kindly enter the name of the Controller"
        },
        "title": {
            "type": "String",
            "required": "Kindly enter the title of the Controller"
        },
        "route": {
            "type": "String",
            "required": "Kindly enter the route of the Controller"
        },

        "created_at": {
            "type": Date,
            "default": Date.now()
        },
        "created_by": {
            "type": "System",
            "required": "Kindly enter the Controller who made the record"
        },
        "updated_at": {
            "type": Date.now()
        },
        "updated_by": {
            "type": "System",
            "required": "Kindly enter the Controller who updated the record"
        },
        "alive": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Controller is alive"
        },
        "active": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if Controller is active"
        },
        "tipodedocumento": "controller"
    };
}