const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');



// Load environment variables
dotenv.config();

// Passport config
require('./config/passport')(passport);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const historyRoutes = require('./routes/history');
const calendarRoutes = require('./routes/calendar');
const quizRoutes = require('./routes/quiz');
const chatRoutes = require('./routes/chat');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['https://ethiopia-calander.vercel.app', 'https://ethiopia-calander-s56f.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Session middleware (for OAuth)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes - Order matters! More specific routes should come first
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes); // Chat routes with proper ordering inside the router

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Debug route to list all registered routes (only in development)
if (process.env.NODE_ENV === 'development') {
    app.get('/api/debug/routes', (req, res) => {
        const routes = [];
        app._router.stack.forEach(middleware => {
            if (middleware.route) {
                routes.push({
                    path: middleware.route.path,
                    methods: Object.keys(middleware.route.methods)
                });
            } else if (middleware.name === 'router') {
                middleware.handle.stack.forEach(handler => {
                    if (handler.route) {
                        routes.push({
                            path: '/api/chat' + handler.route.path,
                            methods: Object.keys(handler.route.methods)
                        });
                    }
                });
            }
        });
        res.json(routes);
    });
}

// 404 handler - This must be AFTER all routes
app.use((req, res, next) => {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`); // Debug log
    res.status(404).json({ 
        success: false, 
        message: `Route ${req.method} ${req.originalUrl} not found` 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation Error',
            errors: err.errors 
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized access' 
        });
    }
    
    // Default error response
    res.status(err.status || 500).json({ 
        success: false, 
        message: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`🔄 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received');
    server.close(async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

module.exports = app;
