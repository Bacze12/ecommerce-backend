const jwt = require('jsonwebtoken');

function generateToken(clientId, schema) {
    const payload = { clientId, schema };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

module.exports = { generateToken };
