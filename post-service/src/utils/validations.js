const Joi = require("joi");

const postValidation = (data) => {
  const schema = Joi.object({
    content: Joi.string().required().min(3).max(5000),
    mediaIds: Joi.array(),
  });

  return schema.validate(data);
};

module.exports = { postValidation };
