const express = require('express');
const { generateToken } = require('../services/tokenService');
const router = express.Router();

router.post('/buy-pos', (req, res) => {
    const { clientId, schema } = req.body; // Datos del cliente
    const token = generateToken(clientId, schema);
    const url = `https://posventa.render.com/dashboard?token=${token}`;
    res.json({ url });
});

module.exports = router;
