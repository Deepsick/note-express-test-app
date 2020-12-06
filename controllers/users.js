const User = require('../models/user');
const {
  hashPassword,
  comparePasswords,
  createToken,
} = require('../services/auth');
const userValidator = require('../validators/user');
const logger = require('../config/logger');
const { HttpStatus } = require('../const');
const cacheManager = require('../services/cache');

const createUser = async (req, res) => {
  try {
    const { login, password, secondPassword } = req.body;
    const { error: loginError } = userValidator.validateCreateUser({
      login,
      password,
      secondPassword,
    });

    if (loginError) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: loginError });
      return;
    }

    if (password !== secondPassword) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Passwords should match' });
      return;
    }

    const dbUser = await User.findOne({ where: { login } });
    if (dbUser) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'User is already exist' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const { id, login: username } = await User.create({ login, password: hashedPassword });

    const token = await createToken({ id, username });
    await cacheManager.setToken(token, id);

    res.status(HttpStatus.OK).json({ login, token });
  } catch (error) {
    logger.error(`createUser middleware get such error: ${error}`);
  }
};

const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    const { error } = userValidator.validateLoginUser({ login, password });
    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error });
      return;
    }

    const dbUser = await User.findOne({
      where: {
        login,
      },
    });

    if (!dbUser) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Wrong credentials' });
      return;
    }

    const isPasswordMatch = await comparePasswords(dbUser.password, password);
    if (!isPasswordMatch) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Wrong credentials' });
      return;
    }

    const { id, login: username } = dbUser;
    const token = await createToken({ id, username });
    await cacheManager.setToken(token, id);

    res.status(HttpStatus.OK).json({ login, token });
  } catch (error) {
    logger.error(`login middleware get such error: ${error}`);
  }
};

const logout = async (req, res) => {
  try {
    const { id } = req.user;
    await cacheManager.removeToken(id);

    res.status(HttpStatus.OK).json({ message: 'User is logout' });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = {
  createUser,
  loginUser,
  logout,
};
