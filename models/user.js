module.exports = function(sequelize, dataTypes) {
  return sequelize.define('user', {
    name: {
      type:dataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2,55]
      }
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    pass: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 50]
      }
    }

  });
}
