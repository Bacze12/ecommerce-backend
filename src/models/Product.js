// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida']
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    imageUrl: {
        type: String,
        required: [true, 'La imagen es requerida']
    },
    features: [{
        type: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    additionalInfo: {
        implementationTime: String,
        training: String,
        support: String,
        updates: String,
        customization: String,
        dataBackup: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    integrations: [{
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        description: String
    }]
}, {
    timestamps: true
});

// Middleware para calcular rating promedio
productSchema.pre('save', function(next) {
    if (this.ratings.length > 0) {
        this.averageRating = this.ratings.reduce((acc, item) => item.rating + acc, 0) / this.ratings.length;
        this.numReviews = this.ratings.length;
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);