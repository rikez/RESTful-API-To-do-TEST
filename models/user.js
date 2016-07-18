const bcrypt = require('bcrypt');
const _ = require('underscore');
const cryptojs = require('crypto-js');
const jwt = require('jsonwebtoken');

module.exports = function(sequelize, dataTypes) {
  var user =  sequelize.define('user', {
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
    classMethods: {
      authhenticate: function (body) {
        return new Promise(function (resolve, reject) {
          	if(typeof body.email !== 'string' || typeof body.pass !== 'string') {
          			return reject();
          	}
          	user.findOne({where: {email: body.email} }).then(function(user) {
          		if(!user || !bcrypt.compareSync(body.pass, user.get('pass_hash'))) {
          			return reject();
          		}
          		resolve(user);
          	}, function(e) {
          			reject();
          	});
        });
      },
      findByToken: function (token) {
        return new Promise(function (resolve, reject) {
          try {
              var decodeJWT = jwt.verify(token, 'qwerty');
              var bytes = cryptojs.AES.decrypt(decodeJWT.token, '12345t');
              var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

              user.findById(tokenData.id).then(function(user) {
                  if(user) {
                    resolve(user);
                  } else {
                    reject();
                  }
              }, function () {
                  reject();
              });
          } catch (e) {
              reject();
          }
        })
      }
    },
    instanceMethods: {
      toPublicJSON: function () {
        var json = this.toJSON();
        return _.pick(json, 'id', 'name', 'email', 'createdAt', 'updatedAt');
      },

      genToken: function(type) {
        if(!_.isString(type)){
          return undefined;
        }
        try {
            var stringData = JSON.stringify({id: this.get('id'), type: type});
            var encryptedData = cryptojs.AES.encrypt(stringData, '12345t').toString();
            var token = jwt.sign({token: encryptedData}, 'qwerty');

            return token;
        } catch (e) {

        }
      }

    }
  });

  return user;
};
