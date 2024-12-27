// src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Obtener productos con filtros
router.get('/', async (req, res) => {
    try {
        const { 
            category, 
            minPrice, 
            maxPrice, 
            sort = 'newest',
            page = 1,
            limit = 12
        } = req.query;

        // Construir query
        const query = {};
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Ordenamiento
        let sortOption = {};
        switch (sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'name_asc':
                sortOption = { name: 1 };
                break;
            case 'name_desc':
                sortOption = { name: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .populate('category', 'name slug');

        const total = await Product.countDocuments(query);

        res.json({
            data: products,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error en la ruta de productos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener productos',
            error: error.message 
        });
    }
});

// Obtener categorías
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .select('name slug')
            .sort('name');
            
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error en la ruta de categorías:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener categorías',
            error: error.message 
        });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug');
            
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener el producto',
            error: error.message 
        });
    }
});

// Crear un producto (admin)
router.post('/', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear el producto',
            error: error.message 
        });
    }
});

// Actualizar un producto (admin)
router.put('/:id', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar el producto',
            error: error.message 
        });
    }
});

// Eliminar un producto (admin)
router.delete('/:id', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Producto eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar el producto',
            error: error.message 
        });
    }
});

module.exports = router;