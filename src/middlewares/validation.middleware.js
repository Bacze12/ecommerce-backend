const { check, validationResult } = require('express-validator');
const Joi = require('joi');

// Express-validator validation rules
const registerValidationRules = () => {
    return [
        check('name').notEmpty().withMessage('Name is required'),
        check('email').isEmail().withMessage('Email is invalid'),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ];
};

const loginValidationRules = () => {
    return [
        check('email').isEmail().withMessage('Email is invalid'),
        check('password').notEmpty().withMessage('Password is required')
    ];
};

// Joi schemas
const cartItemSchema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required()
});

const orderSchema = Joi.object({
    items: Joi.array().items(Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().required()
    })).required(),
    billing: Joi.object({
        type: Joi.string().valid('boleta', 'factura').required(),
        rut: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().optional(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        region: Joi.string().required(),
        businessName: Joi.string().optional(),
        businessRut: Joi.string().optional(),
        giro: Joi.string().optional()
    }).required(),
    payment: Joi.object({
        method: Joi.string().valid('credit_card', 'bank_transfer').required(),
        status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded').default('pending'),
        transactionId: Joi.string().optional(),
        paymentDate: Joi.date().optional(),
        cardLast4: Joi.string().optional()
    }).required(),
    status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').default('pending'),
    subtotal: Joi.number().required(),
    tax: Joi.number().required(),
    total: Joi.number().required(),
    discount: Joi.object({
        code: Joi.string().optional(),
        amount: Joi.number().optional()
    }).optional(),
    invoiceNumber: Joi.string().optional(),
    invoiceUrl: Joi.string().optional(),
    notes: Joi.string().optional(),
    licenses: Joi.array().items(Joi.object({
        key: Joi.string().required(),
        activationDate: Joi.date().required(),
        expiryDate: Joi.date().required(),
        status: Joi.string().valid('pending', 'active', 'expired', 'revoked').default('pending')
    })).optional()
});

// Custom validation functions
const validateRegister = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const validateCartItem = (req, res, next) => {
    const { error } = cartItemSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};

const validateOrder = (req, res, next) => {
    const { error } = orderSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};

module.exports = {
    registerValidationRules,
    loginValidationRules,
    validateRegister,
    validateLogin,
    validateCartItem,
    validateOrder
};
