// src/config/constants.js
const constants = {
    JWT: {
        SECRET: process.env.JWT_SECRET || 'your-secret-key',
        EXPIRES_IN: '24h'
    },
    CORS: {
        ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
    },
    ROLES: {
        ADMIN: 'admin',
        USER: 'user'
    },
    STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        SERVER_ERROR: 500
    }
};

module.exports = constants;