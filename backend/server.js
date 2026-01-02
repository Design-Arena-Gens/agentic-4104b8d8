const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// In-memory data storage (replace with database in production)
let services = [
    {
        id: '1',
        name: 'Network Infrastructure Setup',
        category: 'Network Support',
        price: 2500,
        duration: 8,
        status: 'Active',
        description: 'Complete network infrastructure setup and configuration'
    },
    {
        id: '2',
        name: 'Cloud Migration',
        category: 'Cloud Services',
        price: 5000,
        duration: 40,
        status: 'Active',
        description: 'Migrate your infrastructure to cloud platforms'
    },
    {
        id: '3',
        name: 'Cybersecurity Audit',
        category: 'Security',
        price: 3000,
        duration: 16,
        status: 'Active',
        description: 'Comprehensive security assessment and recommendations'
    }
];

let clients = [
    {
        id: '1',
        companyName: 'Tech Startup Inc',
        contactPerson: 'John Doe',
        email: 'john@techstartup.com',
        phone: '555-0100',
        type: 'Startup',
        address: '123 Tech St, San Francisco, CA'
    },
    {
        id: '2',
        companyName: 'Enterprise Corp',
        contactPerson: 'Jane Smith',
        email: 'jane@enterprise.com',
        phone: '555-0200',
        type: 'Enterprise',
        address: '456 Business Ave, New York, NY'
    }
];

let bookings = [
    {
        id: '1',
        clientId: '1',
        serviceId: '1',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '09:00',
        status: 'Pending',
        notes: 'Initial consultation'
    },
    {
        id: '2',
        clientId: '2',
        serviceId: '3',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        status: 'Confirmed',
        notes: 'Security assessment'
    }
];

let users = [];

// Import routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const clientRoutes = require('./routes/clients');
const bookingRoutes = require('./routes/bookings');

// Pass data storage to routes
app.use((req, res, next) => {
    req.dataStore = { services, clients, bookings, users };
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'IT Services Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            services: '/api/services',
            clients: '/api/clients',
            bookings: '/api/bookings',
            health: '/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
