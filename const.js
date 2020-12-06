const LoggerPath = {
  ERROR: 'logs/error.log',
  COMBINED: 'logs/combined.log',
  ACCESS: 'logs/access.log',
};

const LogLevel = {
  ERROR: 'error',
  INFO: 'info',
  COMBINED: 'combined',
};

const HttpStatus = {
  OK: 200,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
};

const TimeIn = {
  SECONDS: 60,
  MINUTES: 60,
  MS_SECONDS: 1000,
};

const ApiRoute = {
  USERS: '/api/users',
  NOTES: '/api/notes',
  DOCS: '/api-docs',
};
const DEFAULT_PORT = 3064;

module.exports = {
  LoggerPath,
  LogLevel,
  HttpStatus,
  TimeIn,
  ApiRoute,
  DEFAULT_PORT,
};
