const Joi = require('joi');

const userValidationSchema = Joi.object({
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
    confirmPassword: Joi.ref('password'),
    email: Joi.string()
        .email()
    })
    .with('password', 'confirmPassword')
    .messages({
        "string.alphanum": "Name must only contain alpha-numeric characters and no spaces. First names only people!",
        "string.pattern.base": "Passwords need to be at least 3 characters long and contain alpha-numeric characters only.",
        "any.only": "Passwords do not match.",
        "string.email": "Please enter a valid email."
    });

module.exports = userValidationSchema;