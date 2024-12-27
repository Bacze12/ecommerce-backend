// backend/src/models/Order.js
const mongoose = require('mongoose');
const { generateLicenseKey } = require('../utils/licenseUtils');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: Number,
        price: Number
    }],
    billing: {
        type: {
            type: String,
            enum: ['boleta', 'factura'],
            required: true
        },
        rut: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: String,
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        region: {
            type: String,
            required: true
        },
        // Campos adicionales para factura
        businessName: String,
        businessRut: String,
        giro: String
    },
    payment: {
        method: {
            type: String,
            enum: ['credit_card', 'bank_transfer'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        paymentDate: Date,
        cardLast4: String
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    discount: {
        code: String,
        amount: Number
    },
    invoiceNumber: String,
    invoiceUrl: String,
    notes: String,
    licenses: [{
        key: String,
        activationDate: Date,
        expiryDate: Date,
        status: {
            type: String,
            enum: ['pending', 'active', 'expired', 'revoked'],
            default: 'pending'
        }
    }]
}, {
    timestamps: true
});

// Middleware para generar número de orden
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Generar número de orden secuencial
        const lastOrder = await this.constructor.findOne().sort({ createdAt: -1 });
        const lastNumber = lastOrder ? parseInt(lastOrder.invoiceNumber || '0') : 0;
        this.invoiceNumber = String(lastNumber + 1).padStart(6, '0');
    }
    next();
});

// Método para calcular totales
// Validar elementos antes de calcular totales
orderSchema.methods.calculateTotals = function() {
    if (!this.items || !Array.isArray(this.items)) {
        throw new Error('La orden debe incluir una lista de items válida.');
    }

    this.subtotal = this.items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
            throw new Error('Cada item debe tener un precio y cantidad válidos.');
        }
        return sum + (item.price * item.quantity);
    }, 0);

    this.tax = this.subtotal * 0.19; // IVA 19%
    this.total = this.subtotal + this.tax;

    if (this.discount && this.discount.amount) {
        this.total -= this.discount.amount;
    }
};


// Método para generar licencias
orderSchema.methods.generateLicenses = function() {
    console.log('Generando licencias...');
    this.items.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            const licenseKey = generateLicenseKey(); // Asegúrate de que esta función esté correctamente implementada
            console.log(`Generando licencia para producto ${item.product}: ${licenseKey}`);
            this.licenses.push({
                key: licenseKey,
                activationDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
                status: 'active'
            });
        }
    });
};


// Índices
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'billing.rut': 1 });
orderSchema.index({ invoiceNumber: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;