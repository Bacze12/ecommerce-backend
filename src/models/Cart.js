// backend/src/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    total: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Middleware para calcular el total
cartSchema.pre('save', async function(next) {
    try {
        await this.populate('items.product');
        this.total = this.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Cart', cartSchema);