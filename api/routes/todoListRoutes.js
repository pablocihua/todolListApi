'use strict';

var express = require('express');
var router  = express.Router();

var todoList = require('../controllers/todoListController');

/* module.exports = function( app ){

    app //.Router('/tasks')
        .get('/tasks', todoList.list_all_tasks )
        .post('/tasks',  todoList.create_a_task );

    app.route('/tasks/:taskId')
        .get( todoList.read_a_task )
        .put( todoList.update_a_task )
        .delete( todoList.delete_a_task );
}; */

router.use(function timeLog( req, res, next ){
    console.log('Time: ' + Date.now());
    next();
})

router.get('/tasks', todoList.list_all_tasks )
      .post('/tasks',  todoList.create_a_task );

module.exports = router;