const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const bcrypt = require('bcrypt');
const middleware = require('./middleware.js')(db);
var todoID = 1;
var todos = [];

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('To-do API');
});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
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

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
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

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'desc', 'completed');
	db.task.create(body).then(function (task){
			res.json(task.toJSON());
	}, function (e) {
			res.status(404).json(e);
	});
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
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

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var id = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'desc', 'completed');
	var where = {};

			if(body.hasOwnProperty('desc')) {
				where.desc = body.desc;
			}
			if(body.hasOwnProperty('completed')) {
				where.completed = body.completed;
			}

			db.task.findById(id).then(function (tasks) {
					if(tasks) {
						tasks.update(where).then(function (task) {
								res.json(task.toJSON());
						}, function(e) {
								res.status(400).send();
						})
					} else {
						res.status(404).send();
					}
			}, function(e) {
					res.status(500).send();
			});
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'name', 'email', 'pass');
	db.user.create(body).then(function(user) {
			res.json(user.toPublicJSON());
	}, function(e) {
			res.status(404).json(e);
	})
})

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'pass');
	db.user.authhenticate(body).then(function (user) {
			var token = user.genToken('authentication');
			if(token) {
				res.header('Auth', token).json(user.toPublicJSON());
			} else {
				res.status(401).send();
			}
	}, function () {
			res.status(401).send();
	});
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Listening on port ' + PORT);
	});
})
