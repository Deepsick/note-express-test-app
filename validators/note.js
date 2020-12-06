const Joi = require('joi');

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;

const TextLength = {
  MIN: 10,
  MAX: 1000,
};

const textSchema = Joi
  .string()
  .min(TextLength.MIN)
  .max(TextLength.MAX)
  .required();

const isPublicSchema = Joi
  .boolean()
  .required();

const idSchema = Joi
  .number()
  .integer()
  .required()
  .positive();

const textValidator = Joi.object({
  text: textSchema,
});

const isPublicValidator = Joi.object({
  isPublic: isPublicSchema,
});

const idValidator = Joi.object({
  id: idSchema,
});

const getNotesValidator = Joi.object({
  limit: Joi
    .number()
    .integer()
    .allow(0)
    .positive()
    .default(DEFAULT_LIMIT),
  offset: Joi
    .number()
    .integer()
    .allow(0)
    .positive()
    .default(DEFAULT_OFFSET),
});

module.exports = {
  validateText: textValidator.validate.bind(textValidator),
  validateIsPublic: isPublicValidator.validate.bind(isPublicValidator),
  validateGetNotesParams: getNotesValidator.validate.bind(getNotesValidator),
  validateId: idValidator.validate.bind(idValidator),
  TextLength,
  DEFAULT_OFFSET,
  DEFAULT_LIMIT,
};
