module.exports = function(){
    return {
        "name": {
            "type": "String",
            "required": "Kindly enter the name of the user"
        },
        "surname": {
            "type": "String",
            "required": "Kindly enter the surname of the user"
        },
        "username": {
            "type": "String",
            "required": "Kindly enter the username of the user"
        },
        "password": {
            "type": "String",
            "required": "Kindly enter the password of the user"
        },
        "email": {
            "type": "String",
            "required": "Kindly enter the email of the user"
        },
        "job": {
            "type": "String",
            "required": "Kindly enter the role of the user"
        },
        "role": {
            "type": "String",
            "default": "ROLE_GUEST",
            "required": "Kindly enter the name of the user"
        },
        "created_at": {
            "type": Date,
            "default": Date.now()
        },
        "created_by": {
            "type": "String",
            "required": "Kindly enter the User who made the record"
        },
        "updated_at": {
            "type": "Date"
        },
        "updated_by": {
            "type": "String",
            "required": "Kindly enter the User who updated the record"
        },
        "alive": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if user is alive"
        },
        "active": {
            "type": Boolean,
            "default": true,
            "required": "Kindly enter if user is active"
        },
        "image": "",
        "tipodedocumento": "user"
    };
}