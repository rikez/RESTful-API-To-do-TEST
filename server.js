const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
var todoID = 1;
var todos = [];

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('To-do API');
});

app.get('/todos', function(req, res) {
	var queryParams =  req.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	} else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
				return todo.desc.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}
	res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var ids = parseInt(req.params.id, 10);
	db.task.findById(ids).then(function (task){
		res.json(task.toJSON());
	}, function(e) {
			console.log
	});
	var theTodo = _.findWhere(todos, {id: ids});
	if(theTodo) {
		res.json(theTodo);
	} else {
		res.status(404).send();
	}
});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'desc', 'completed');
	db.task.create(body).then(function (task){
			res.json(task.toJSON());
	}, function (e) {
			res.status(404).json(e);
	});

	/*if (!_.isBoolean(body.completed) || !_.isString(body.desc) || body.desc.trim().length === 0) {
		return res.status(400).send();
	}
	body.desc = body.desc.trim();
	body.id = todoID++;
	todos.push(body);
	res.json(body);*/
});

app.delete('/todos/:id', function(req, res) {
	var id = parseInt(req.params.id, 10);
	todos = _.without(todos, _.findWhere(todos, {id: id}));
	 if(todos) {
		 res.json(todos);
	 } else {
		 res.status(404).json("No todo found to be deleted");
	 }
})

app.put('/todos/:id', function(req, res) {
	var id = parseInt(req.params.id, 10);
	var updatedTodo = _.findWhere(todos, {id: id});
	var body = _.pick(req.body, 'desc', 'completed');
	var validAtt = {};

	if(!updatedTodo) {
		return res.status(404).json("Something went wrong!");
	}
			if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
				validAtt.completed = body.completed;
			} else if(body.hasOwnProperty('completed')) {
						return res.status(400).json("Error");
			}
			if(body.hasOwnProperty('desc') && _.isString(body.desc) && body.desc.trim().length > 0) {
				validAtt.desc = body.desc;
			} else if (body.hasOwnProperty('desc')) {
						return res.status(400).json("Error");
			}
			_.extend(updatedTodo, validAtt);
			res.json(updatedTodo);
})

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Listening on port ' + PORT);
	});
})
