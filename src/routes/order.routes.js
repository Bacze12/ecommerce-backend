const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');
const { generateToken } = require('../service/tokenService');
const Cart = require('../models/Cart'); // Importa el modelo del carrito


const POS_MODULE_ID = process.env.POS_MODULE_ID || 'ID_REAL_DEL_PRODUCTO_POS';

// Crear nueva orden
router.post('/', authMiddleware, async (req, res) => {
    try {
        const orderData = {
            user: req.user._id,
            ...req.body
        };

        // Validaciones de items y facturación
        if (!orderData.items || orderData.items.some(item => !item.product || typeof item.quantity !== 'number' || item.quantity <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Los items deben tener un producto válido y una cantidad mayor a 0.'
            });
        }

        if (!orderData.billing || !['boleta', 'factura'].includes(orderData.billing.type)) {
            return res.status(400).json({
                success: false,
                message: 'El tipo de facturación debe ser "boleta" o "factura".'
            });
        }

        const order = new Order(orderData);

        // Sobrescribir explícitamente el estado de pago enviado por el cliente
        if (req.body.payment && req.body.payment.status) {
            order.payment.status = req.body.payment.status; // Asegúrate de actualizar el estado
        } else {
            console.log('Estado de pago no proporcionado, usando el valor por defecto.');
        }

        order.calculateTotals();

        let accessUrl = null;

        // Generar licencias y token si el pago está completado
        if (order.payment.status === 'completed') {
            console.log('Estado del pago completado, generando licencias...');
            if (!order.licenses || order.licenses.length === 0) {
                order.generateLicenses();
            }

            const posModule = order.items.find(item => item.product.toString() === POS_MODULE_ID);
            if (posModule) {
                const token = generateToken(req.user._id, 'pos');
                console.log('Token generado:', token);
                accessUrl = `https://modulo-pos.tuservidor.com/dashboard?token=${token}`;
            }
        }

        await order.save();

        const populatedOrder = await Order.findById(order._id).populate('items.product');
        res.status(201).json({
            success: true,
            data: populatedOrder,
            accessUrl
        });
    } catch (error) {
        console.error('Error al crear la orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la orden',
            error: error.message
        });
    }
});






// Obtener órdenes del usuario
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort('-createdAt');

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las órdenes',
            error: error.message
        });
    }
});

// Obtener una orden específica
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la orden',
            error: error.message
        });
    }
});

// Actualizar estado de pago de una orden
router.put('/:id/payment', authMiddleware, async (req, res) => {
    try {
        const { status, transactionId } = req.body;
        console.log('Estado recibido:', status); // Registro de depuración
        console.log('ID de transacción recibido:', transactionId); // Registro de depuración

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        // Actualizar el estado de pago a 'completed' si el pago se ha completado
        if (status === 'completed') {
            order.payment.status = 'completed';
            order.payment.transactionId = transactionId;
            order.payment.paymentDate = new Date();
            order.generateLicenses();
            console.log('Estado de pago actualizado a completado'); // Registro de depuración
        } else {
            order.payment.status = status;
            order.payment.transactionId = transactionId;
            order.payment.paymentDate = new Date();
            console.log('Estado de pago actualizado a:', status); // Registro de depuración
        }

        await order.save();
        console.log('Orden guardada:', order); // Registro de depuración

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error al actualizar el pago:', error); // Registro de depuración
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el pago',
            error: error.message
        });
    }
});

// Rutas admin
router.get('/admin/all', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = status ? { status } : {};

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('items.product')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page: Number(page)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las órdenes',
            error: error.message
        });
    }
});

module.exports = router;
