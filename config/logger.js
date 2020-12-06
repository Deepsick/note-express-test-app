const winston = require('winston');
const { LoggerPath, LogLevel } = require('../const');

const logger = new winston.createLogger({
  level: LogLevel.INFO,
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: LoggerPath.ERROR, level: LogLevel.ERROR }),
    new winston.transports.File({ filename: LoggerPath.COMBINED }),
  ],
});

module.exports = logger;
