const os = require('os');
const cluster = require('cluster');

const logger = require('./config/logger');
const app = require('./server');
const db = require('./config/db');
const { DEFAULT_PORT } = require('./const');

const port = process.env.PORT | DEFAULT_PORT;

app.use((req, res, next) => {
  if (cluster.isWorker) {
    logger.info(
      `Worker ${cluster.worker.id} handle request`,
    );
  }

  next();
});

if (cluster.isMaster) {
  logger.info(`Master ${process.pid} is running`);
  const cpus = os.cpus().length;

  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    logger.info(`Worker ${worker.process.pid}  is online.`);
  });

  cluster.on('exit', (worker, code) => {
    logger.info(
      `Worker ${worker.id} finished. Exit code: ${code}`,
    );
  });
} else {
  app.listen(port, process.env.HOST, async () => {
    try {
      logger.info(`App is up and running on port ${port}`);
      await db.authenticate();
      await db.sync();
      logger.info('DB connection has been established successfully.');
    } catch (error) {
      logger.error(`Unable to connect to the database. Error: ${error}`);
    }
  });
}
