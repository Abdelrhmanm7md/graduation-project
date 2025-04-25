import Joi from "joi";

export const registerValidationSchema = Joi.object({
  name: Joi.string().min(2).max(35).required().messages({
    'string.base': `"name" should be a type of 'text'`,
    'string.empty': `"name" cannot be an empty field`,
    'string.min': `"name" should have a minimum length of {#limit}`,
    'string.max': `"name" should have a maximum length of {#limit}`,
    'any.required': `"name" is a required field`
  }),
  email: Joi.string().email().required().messages({
    'string.email': `"email" must be a valid email address`,
    'any.required': `"email" is a required field`
  }),
  password: Joi.string().min(6).required().messages({
    'string.pattern':'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'string.min': `"password" should have a minimum length of {#limit}`,
    'any.required': `"password" is a required field`
  }),
  firstPhone: Joi.string().length(11).pattern(/^\d+$/).required().messages({
    'string.length': `"phoneNumber" should have a length of {#limit}`,
    'string.pattern.base': `"phoneNumber" should contain only digits`,
    'any.required': `"phoneNumber" is a required field`
  }),
  faculty: Joi.string().length(24).required().messages({
    'string.length': `"faculty" must be a valid MongoDB ObjectId (24 characters)`,
    'any.required': `"faculty" is a required field`
  })
});

export const loginValidationSchema = Joi.object({
  email: Joi.string().required().messages({
    'any.required': `"email" is a required field`
  }),
  password: Joi.string().required().messages({
    'any.required': `"password" is a required field`
  })
});