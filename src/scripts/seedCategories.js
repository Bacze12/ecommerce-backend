// src/scripts/seedCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
    {
        name: 'Electrónicos',
        description: 'Productos electrónicos y gadgets'
    },
    {
        name: 'Ropa',
        description: 'Todo tipo de ropa y accesorios'
    },
    {
        name: 'Hogar',
        description: 'Productos para el hogar'
    },
    {
        name: 'Deportes',
        description: 'Equipamiento y ropa deportiva'
    },
    {
        name: 'Libros',
        description: 'Libros y material de lectura'
    },
    {
        name: 'Juguetes',
        description: 'Juguetes y juegos'
    },
    {
        name: 'Belleza',
        description: 'Productos de belleza y cuidado personal'
    },
    {
        name: 'Alimentos',
        description: 'Alimentos y bebidas'
    }
];

const seedCategories = async () => {
    try {
        // Conexión a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Eliminar categorías existentes
        await Category.deleteMany({});
        console.log('Categorías anteriores eliminadas');

        // Crear nuevas categorías una por una
        const createdCategories = [];
        for (const category of categories) {
            const newCategory = await Category.create(category);
            createdCategories.push(newCategory);
            console.log(`Categoría creada: ${newCategory.name} (${newCategory.slug})`);
        }

        console.log(`\nProceso de seeding completado. ${createdCategories.length} categorías creadas.`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error durante el seeding:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

// Manejar errores de proceso
process.on('unhandledRejection', (error) => {
    console.error('Error no manejado:', error);
    mongoose.disconnect().then(() => {
        process.exit(1);
    });
});

// Ejecutar el seeding
seedCategories();