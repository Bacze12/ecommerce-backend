// backend/src/utils/licenseUtils.js
const crypto = require('crypto');

function generateLicenseKey() {
    return crypto.randomBytes(16).toString('hex'); // Genera una clave única de 16 bytes en formato hexadecimal
}

module.exports = { generateLicenseKey };
