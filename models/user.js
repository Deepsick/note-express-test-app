const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { LoginLength, PasswordLength } = require('../validators/user');

const User = sequelize.define('User', {
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    len: [LoginLength.MIN, LoginLength.MAX],
    isAlphanumeric: true,
  },
  password: {
    type: DataTypes.STRING,
    len: [PasswordLength.MIN, PasswordLength.MAX],
    allowNull: false,
  },
});

User.associations = (models) => User.hasMany(models.Note, {
  as: 'notes',
});

module.exports = User;
