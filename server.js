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
	var query =  req.query;
	var where = {};
	if(query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if(query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if(query.hasOwnProperty('q') && query.q.length > 0) {
			where.desc = {
				$like: '%' + query.q + '%'
			};
	}
	query = _.pick(where, 'completed', 'desc');
	db.task.findAll({where: where}).then(function(tasks) {
			res.json(tasks);
	}, function (e) {
			res.status(500).send();
	});
});

app.get('/todos/:id', function(req, res) {
	var ids = parseInt(req.params.id, 10);
	db.task.findById(ids).then(function (task){
			if(!!task) {
			res.json(task.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
			res.status(500).json(e);
	});
});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'desc', 'completed');
	db.task.create(body).then(function (task){
			res.json(task.toJSON());
	}, function (e) {
			res.status(404).json(e);
	});
});

app.delete('/todos/:id', function(req, res) {
	var id = parseInt(req.params.id, 10);
	db.task.destroy({where: {id: id}}).then(function (rowsDeleted) {
		if(rowsDeleted === 0) {
					res.status(404).json({
						error: 'No deleted data'
					});
		} else {
					res.status(200).send();
		}
	}, function (e) {
		res.status(500).json(e);
	});
});

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
