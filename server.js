const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var todoID = 1;
var todos = [];

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('To-do API');
});

app.get('/todos', function(req, res) {
	res.json(todos);
});

app.get('/todos/:id', function(req, res) {
	var ids = parseInt(req.params.id, 10);
	var theTodo;
	for(var i = 0; i < todos.length; i++) {
		if(ids === todos[i].id) {
			theTodo = todos[i];
		}
	}
	if(theTodo) {
		res.json(theTodo);
	} else {
		res.status(404).send();
	}
});

app.post('/todos', function(req, res) {
	var body = req.body;
	body.id = todoID++;
	todos.push(body);

	res.json(body);
});

app.listen(PORT, function() {
	console.log('Listening on port ' + PORT);
});
