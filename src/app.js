require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const generateToken  = require('./service/tokenService');
const categoriesRoutes = require('./routes/category.routes');
const modulo = require('./routes/moduleRoutes');
const   router = express.Router();

const app = express();

// Conectar a la base de datos
connectDB();

// Configuración del rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por ventana por IP
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Incrementar para desarrollo
    skipSuccessfulRequests: true, // No contar peticiones exitosas
    skip: (req) => process.env.NODE_ENV === 'development' // Saltar en desarrollo
});

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(mongoSanitize());

// Aplicar rate limiting solo a rutas de autenticación
app.use('/api/auth', limiter);

// Rutas
app.use('/api/categories', categoriesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/module', modulo);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.log('Error no manejado:', err.message);
    // No cerrar el servidor en desarrollo
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});
