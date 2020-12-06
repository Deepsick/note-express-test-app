const Joi = require('joi');

const LoginLength = {
  MIN: 3,
  MAX: 100,
};

const PasswordLength = {
  MIN: 6,
  MAX: 30,
};

const loginSchema = Joi
  .string()
  .min(LoginLength.MIN)
  .max(LoginLength.MAX)
  .alphanum()
  .required();

const passwordSchema = Joi
  .string()
  .min(PasswordLength.MIN)
  .max(PasswordLength.MAX)
  .alphanum()
  .required();

const createUserValidator = Joi.object({
  login: loginSchema,
  password: passwordSchema,
  secondPassword: passwordSchema,
});

const loginUserValidator = Joi.object({
  login: loginSchema,
  password: passwordSchema,
});

module.exports = {
  validateLoginUser: loginUserValidator.validate.bind(loginUserValidator),
  validateCreateUser: createUserValidator.validate.bind(createUserValidator),
  LoginLength,
  PasswordLength,
};
