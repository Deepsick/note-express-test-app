const { decodeToken } = require('../services/auth');
const cacheManager = require('../services/cache');
const logger = require('../config/logger');
const { HttpStatus } = require('../const');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const payload = await decodeToken(token);
    if (!payload) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token is invalid' });
      return;
    }

    const { id } = payload;
    const isValid = await cacheManager.isValidToken(token, id);
    if (!isValid) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token is invalid' });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    logger.error(error);
  }
};
