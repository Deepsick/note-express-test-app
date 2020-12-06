const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { TimeIn } = require('../const');

const hashPassword = (password) => (
  new Promise((resolve, reject) => {
    bcrypt.genSalt(+process.env.SALT_ROUNDS, (error, salt) => {
      if (error) {
        reject(error);
      }

      bcrypt.hash(password, salt, (hashError, hash) => {
        if (hashError) {
          reject(hashError);
        }

        resolve(hash);
      });
    });
  })
);

const comparePasswords = (hashedPassword, password) => (
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedPassword, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  })
);

const createToken = (payload) => (
  new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.TOKEN_SECRET, {
        algorithm: process.env.TOKEN_HASH_ALGORITHM,
        expiresIn:
          process.env.TOKEN_EXPIRES_IN_HOURS
          * TimeIn.MINUTES
          * TimeIn.SECONDS
          * TimeIn.MS_SECONDS,
      }, (error, token) => {
        if (error) {
          reject(error);
        }

        resolve(token);
      },
    );
  })
);

const decodeToken = (token) => (
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
      if (error) {
        reject(error);
      }

      resolve(payload);
    });
  })
);

module.exports = {
  hashPassword,
  comparePasswords,
  createToken,
  decodeToken,
};
