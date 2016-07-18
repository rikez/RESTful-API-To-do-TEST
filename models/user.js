const bcrypt = require('bcrypt');
const _ = require('underscore');

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
    salt: {
      type: dataTypes.STRING
    },
    pass_hash: {
      type: dataTypes.STRING
    },
    pass: {
      type: dataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [6, 50]
      },
      set: function(value) {
        var salt = bcrypt.genSaltSync(10);
        var hashedPass = bcrypt.hashSync(value, salt);

        this.setDataValue('pass', value);
        this.setDataValue('salt', salt);
        this.setDataValue('pass_hash', hashedPass);
      }
    }

  }, {
    hooks: {
        beforeValidate: function(user, options) {
          if(typeof user.email === 'string') {
            user.email = user.email.toLowerCase();
          }
        }
    },
    instanceMethods: {
      toPublicJSON: function () {
        var json = this.toJSON();
        return _.pick(json, 'id', 'name', 'email', 'createdAt', 'updatedAt');
      }
    }
  });
}
