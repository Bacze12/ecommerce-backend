// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');
const User = require('../models/User');

// Obtener todos los usuarios (solo admin)
router.get('/', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Actualizar perfil de usuario
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email
            });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;