const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
	res.send('To-do API');
})

app.listen(PORT, function() {
	console.log('Listening on port ' + PORT);
})
