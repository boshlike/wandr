const Joi = require('joi');

const profileValidationSchema = Joi.object({
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .email()
        .required(),
    aboutMe: Joi.string()
        .min(0)
        .max(500)
    })
    .messages({
        "string.alphanum": "Name must only contain alpha-numeric characters and no spaces. First names only people!",
        "string.empty": "Name and Email fields are not allowed to be empty",
        "string.email": "Please enter a valid email."
    });

module.exports = profileValidationSchema;