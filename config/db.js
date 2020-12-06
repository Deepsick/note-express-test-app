const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = process.env.NODE_ENV === 'testing'
  ? new Sequelize({
    dialect: 'sqlite',
    storage: ':memory',
    logging: false,
  })
  : new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    logging: logger.info.bind(logger),
  });

module.exports = sequelize;
