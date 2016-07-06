module.exports = function(sequelize, dataTypes) {
  return sequelize.define('task', {
      desc: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
            len:[1, 250]
        }
      },
      completed: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
  });
};
