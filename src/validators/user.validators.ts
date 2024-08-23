import Joi from 'joi';
import { VALIDATION_MESSAGES } from '../constants/validation.constant';

export const registerSchema = Joi.object({
    userName: Joi.string().required().messages({
        'string.empty': VALIDATION_MESSAGES.USERNAME_REQUIRED,
        'any.required': VALIDATION_MESSAGES.USERNAME_REQUIRED
    }),

    email: Joi.string().email().required().messages({
        'string.email': VALIDATION_MESSAGES.EMAIL_INVALID,
        'string.empty': VALIDATION_MESSAGES.EMAIL_REQUIRED,
        'any.required': VALIDATION_MESSAGES.EMAIL_REQUIRED
    }),

    password: Joi.string().min(8).required().messages({
        'string.min': VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
        'string.empty': VALIDATION_MESSAGES.PASSWORD_REQUIRED,
        'any.required': VALIDATION_MESSAGES.PASSWORD_REQUIRED
    })
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': VALIDATION_MESSAGES.EMAIL_INVALID,
        'string.empty': VALIDATION_MESSAGES.EMAIL_REQUIRED,
        'any.required': VALIDATION_MESSAGES.EMAIL_REQUIRED
    }),

    password: Joi.string().min(8).required().messages({
        'string.min': VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
        'string.empty': VALIDATION_MESSAGES.PASSWORD_REQUIRED,
        'any.required': VALIDATION_MESSAGES.PASSWORD_REQUIRED
    })
});
