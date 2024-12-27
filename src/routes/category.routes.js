const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener categorías', error });
    }
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener la categoría', error });
    }
});

// Crear una nueva categoría (solo admin)
router.post('/', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const category = new Category({ name, description, isActive });
        await category.save();
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear la categoría', error });
    }
});

// Actualizar una categoría (solo admin)
router.put('/:id', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        category.name = name || category.name;
        category.description = description || category.description;
        category.isActive = isActive !== undefined ? isActive : category.isActive;
        await category.save();
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar la categoría', error });
    }
});

// Eliminar una categoría (solo admin)
router.delete('/:id', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        await category.remove();
        res.json({ success: true, message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar la categoría', error });
    }
});

module.exports = router;