const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();
const { client } = require('./config/redis');
const swaggerDocs = require('./swagger.json');
const notesRouter = require('./routes/notes');
const usersRouter = require('./routes/users');
const {
  LoggerPath,
  LogLevel,
  ApiRoute,
  TimeIn,
} = require('./const');

const app = express();
/* eslint-disable-next-line */
const limiter = require('express-limiter')(app, client);
const accessLogStream = fs.createWriteStream(path.join(__dirname, LoggerPath.ACCESS), { flags: 'a' });

if (process.env.NODE_ENV !== 'testing') {
  limiter({
    path: '*',
    method: 'all',
    lookup: 'connection.remoteAddress',
    total: process.env.MAX_CONNECTION_AMOUNT,
    expire: TimeIn.MS_SECONDS * process.env.LIMITER_EXPIRATION,
  });
}
app.use(express.json());
app.use(morgan(LogLevel.COMBINED, { stream: accessLogStream }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(compression());

app.use(ApiRoute.USERS, usersRouter);
app.use(ApiRoute.NOTES, notesRouter);
app.use(ApiRoute.DOCS, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = app;
