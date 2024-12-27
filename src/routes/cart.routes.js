const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateCartItem } = require('../middlewares/validation.middleware');

// Obtener el carrito del usuario
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(400).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');
            
        if (!cart) {
            cart = await Cart.create({ 
                user: req.user._id,
                items: [],
                total: 0
            });
        }

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el carrito'
        });
    }
});

// Agregar item al carrito
router.post('/items', authMiddleware, validateCartItem, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Validar que solo se permite una licencia por módulo
        if (quantity !== 1) {
            return res.status(400).json({
                success: false,
                message: 'Solo se permite una licencia por módulo'
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity = quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar al carrito'
        });
    }
});


// backend/src/routes/cart.routes.js
router.put('/items/:itemId', authMiddleware, validateCartItem, async (req, res) => {
    try {
        const quantity = Number(req.body.quantity); // Asegurarnos de que es un número
        
        // Validar que quantity es un número válido
        if (isNaN(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Cantidad inválida'
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }

        // Encontrar el ítem usando findIndex
        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado en el carrito'
            });
        }

        // Actualizar la cantidad directamente
        cart.items[itemIndex].quantity = quantity;

        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Error al actualizar item:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el item'
        });
    }
});

// Limpiar el carrito del usuario
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }

        // Vaciar los items del carrito
        cart.items = [];
        cart.total = 0; // Reiniciar el total
        await cart.save();

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Error al limpiar el carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al limpiar el carrito'
        });
    }
});


// Eliminar item del carrito
router.delete('/items/:itemId', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }

        cart.items = cart.items.filter(
            item => item._id.toString() !== req.params.itemId
        );

        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Error al eliminar item:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el item'
        });
    }
});

module.exports = router;
