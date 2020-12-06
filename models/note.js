const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { TextLength } = require('../validators/note');

const Note = sequelize.define('Note', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
    len: [TextLength.MIN, TextLength.MAX],
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Note.associations = (models) => Note.belongsTo(models.User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = Note;
