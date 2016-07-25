const Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic:sqlite.sqlite'
});

var taskList = sequelize.define('task', {
  desc: {
    type: Sequelize.STRING,
    allowNull: false,
    validate:{
        len:[1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

var User = sequelize.define('user', {
  email: Sequelize.STRING
});

taskList.belongsTo(User);
User.hasMany(taskList);

sequelize.sync({force: true}).then(function() {
    console.log('It is all synced');
});
