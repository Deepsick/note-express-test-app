const client = require('../config/redis');
const { TimeIn } = require('../const');

const removeToken = async (userId) => {
  const isExist = await client.exists(userId);
  if (!isExist) {
    return;
  }

  await client.del(userId);
};

const setToken = async (token, userId) => {
  await removeToken(userId);
  await client.set(userId, token);
  const expiredIn = process.env.TOKEN_EXPIRES_IN_HOURS * TimeIn.SECONDS * TimeIn.MINUTES;
  await client.expire(userId, expiredIn);
};

const getToken = async (userId) => {
  const isExist = await client.exists(userId);
  if (!isExist) {
    return;
  }

  return client.get(userId);
};

const isValidToken = async (token, userId) => {
  const dbToken = await getToken(userId);

  if (!dbToken) {
    return false;
  }

  return dbToken === token;
};

module.exports = {
  setToken,
  removeToken,
  isValidToken,
};
