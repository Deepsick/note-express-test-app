const { promisify } = require('util');
const redis = require('redis');
const logger = require('./logger');

const client = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
});

client.on('error', (error) => {
  logger.error(error);
});

client.on('connect', () => {
  logger.info('Redis connected');
});

const existsAsync = promisify(client.exists).bind(client);
const expireAsync = promisify(client.expire).bind(client);
const delAsync = promisify(client.del).bind(client);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const close = async () => {
  await new Promise((resolve) => {
    client.quit(() => {
      resolve();
    });
  });
  await new Promise((resolve) => setImmediate(resolve));
};

const drop = async () => {
  await new Promise((resolve) => {
    client.flushall(() => {
      resolve();
    });
  });
  await new Promise((resolve) => setImmediate(resolve));
};

module.exports = {
  get: getAsync,
  set: setAsync,
  del: delAsync,
  exists: existsAsync,
  expire: expireAsync,
  close,
  drop,
  client,
};
