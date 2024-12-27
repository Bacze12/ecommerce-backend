// src/scripts/seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const modules = [
    {
        name: 'Punto de Venta',
        description: 'Sistema completo de gestión de ventas e inventario con facturación electrónica',
        features: ['Inventario', 'Facturación', 'Caja', 'Reportes']
    },
    {
        name: 'Finanzas',
        description: 'Control financiero integral con gestión de flujo de caja y presupuestos',
        features: ['Tesorería', 'Presupuestos', 'Flujo de Caja', 'Inversiones']
    },
    {
        name: 'Contabilidad',
        description: 'Sistema contable completo con integración tributaria',
        features: ['Libro Mayor', 'Balance', 'Impuestos', 'Reportes Tributarios']
    },
    {
        name: 'Restaurantes',
        description: 'Gestión integral para restaurantes y servicios de comida',
        features: ['Comandas', 'Inventario', 'Mesas', 'Delivery']
    },
    {
        name: 'RRHH',
        description: 'Gestión completa de recursos humanos y nómina',
        features: ['Nómina', 'Asistencia', 'Vacaciones', 'Evaluaciones']
    },
    {
        name: 'Prevención de Riesgos',
        description: 'Sistema de gestión de seguridad y salud ocupacional',
        features: ['Accidentabilidad', 'Capacitaciones', 'Inspecciones', 'Documentación']
    },
    {
        name: 'CRM',
        description: 'Gestión de relaciones con clientes y seguimiento comercial',
        features: ['Contactos', 'Oportunidades', 'Seguimiento', 'Campañas']
    },
    {
        name: 'Business Intelligence',
        description: 'Análisis de datos y reportes integrados de todos los módulos',
        features: ['Dashboards', 'Reportes', 'KPIs', 'Predicciones']
    }
];

const products = modules.map(module => ({
    name: `Módulo ${module.name}`,
    description: `${module.description}. Incluye: ${module.features.join(', ')}`,
    price: Math.floor(Math.random() * (2000000 - 500000) + 500000), // Precios entre 500,000 y 2,000,000
    category: null, // Se llenará después
    imageUrl: '/images/modules/default-module.png', // Imagen por defecto
    stock: 999, // Al ser software, el stock es ilimitado
    features: module.features,
    specifications: {
        'Tipo de Licencia': 'Suscripción Anual',
        'Soporte': '24/7',
        'Actualizaciones': 'Incluidas',
        'Capacitación': 'Incluida (20 horas)',
        'Implementación': 'Incluida',
        'Usuarios': 'Ilimitados',
        'Integración': 'Con todos los módulos del sistema'
    },
    additionalInfo: {
        implementationTime: '2-4 semanas',
        training: '20 horas incluidas',
        support: '24/7 por ticket y teléfono',
        updates: 'Mensuales',
        customization: 'Disponible',
        dataBackup: 'Diario automático'
    }
}));

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Limpiar datos existentes
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Base de datos limpiada');

        // Crear categorías
        const createdCategories = await Category.create(
            modules.map(module => ({
                name: module.name,
                description: module.description
            }))
        );
        console.log('Categorías creadas');

        // Crear productos con referencias a categorías
        const productsWithCategories = products.map((product, index) => ({
            ...product,
            category: createdCategories[index]._id
        }));

        await Product.create(productsWithCategories);
        console.log('Productos creados');

        console.log('Proceso de seeding completado exitosamente');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error durante el seeding:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedDatabase();