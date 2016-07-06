const Sequelize = require('sequelize');

var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic:sqlite-databse.sqlite'
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
})

sequelize.sync({force: true}).then(function() {
    console.log('It is all synced');

    taskList.create({
      desc: 'Walk dog',
      completed: false
    }).then(function (task) {
        return taskList.create({
          desc: 'Clean cheat'
        });
    }).then(function() {
          return taskList.findAll({
            where: {
              desc: {
                $like: '%cheat%'
              }
            }
          });
    }).then(function(tasks){
          if(tasks) {
            tasks.forEach(function(task){
              console.log(task.toJSON());
            });
          } else{
            console.log('No tasks')
          }
    }).catch(function(e) {
        console.log(e);
    })
});
