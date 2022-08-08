const Joi = require('joi');

const loginValidationSchema = Joi.object({
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
    email: Joi.string()
        .email()
    })
    .with('email', 'password')
    .messages({
        "string.empty": "No fields are allowed to be empty.",
        "string.pattern.base": "Passwords need to be at least 3 characters long and contain alpha-numeric characters only.",
        "any.only": "No fields are allowed to be empty.",
        "string.email": "Please enter a valid email."
    });

module.exports = loginValidationSchema;