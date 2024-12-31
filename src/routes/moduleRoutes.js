const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Ruta para comprar POS y generar URL dinámica
router.post('/buy-pos', (req, res) => {
    const { clientId, schema } = req.body; // Datos del cliente
    if (!clientId || !schema) {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    // Generar token JWT
    const token = jwt.sign(
        { clientId, schema },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Generar URL dinámica
    const url = `https://inventory-pos-frontend.vercel.app/dashboard?token=${token}`;
    res.json({ url });
});

module.exports = router;