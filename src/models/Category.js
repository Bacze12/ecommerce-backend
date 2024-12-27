// src/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Función para generar slug
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

// Middleware para generar el slug antes de validar
categorySchema.pre('validate', function(next) {
    if (this.name) {
        this.slug = generateSlug(this.name);
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);