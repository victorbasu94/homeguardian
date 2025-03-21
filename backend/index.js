require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('mongo-sanitize');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import custom modules
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const swaggerDocs = require('./config/swagger');
const { initReminderService } = require('./services/reminderService');
const { initCronJobs } = require('./services/cronService');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize reminder service
initReminderService();

// Initialize cron jobs for scheduled tasks
initCronJobs();

// Security middleware with relaxed settings for development
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'", 
          "https://maintainmint.vercel.app", 
          "https://maintainmint-backend-6dfe05c4ba93.herokuapp.com",
          // Add localhost URLs for testing production builds locally
          "http://localhost:3000",
          "http://localhost:5000",
          "http://localhost:5173",
          "http://localhost:8000",
          "http://localhost:8080",
          "http://localhost:8888"
        ],
        frameSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }
  }));
} else {
  // In development, disable Helmet completely to avoid any CORS issues
  console.log('Running in development mode - security features are relaxed');
  // app.use(helmet({
  //   contentSecurityPolicy: false,
  //   crossOriginEmbedderPolicy: false,
  //   crossOriginResourcePolicy: false,
  //   crossOriginOpenerPolicy: false
  // }));
}

// Add a middleware to log all requests
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.method !== 'GET' && req.body) {
    // Don't log passwords
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    console.log('Request Body:', JSON.stringify(sanitizedBody, null, 2));
  }
  
  // Capture the original end method
  const originalEnd = res.end;
  
  // Override the end method
  res.end = function(chunk, encoding) {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Log response details
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode} sent in ${duration}ms`);
    console.log('Response Headers:', JSON.stringify(res.getHeaders(), null, 2));
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      // Production
      'https://maintainmint.vercel.app',
      'https://maintainmint-backend-6dfe05c4ba93.herokuapp.com',
      // Development - localhost with various ports
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:8000',
      'http://localhost:8080',
      'http://localhost:8888',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8888',
      // Add any other origins you need
    ];
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      callback(null, true); // Still allow it for now, but log it
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Add a middleware to handle preflight requests
app.options('*', (req, res) => {
  console.log('Global OPTIONS handler called for:', req.url);
  
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Set the appropriate CORS headers
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(200).send();
});

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests' }
});
app.use(limiter);

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize(req.body);
  }
  if (req.params) {
    req.params = mongoSanitize(req.params);
  }
  if (req.query) {
    req.query = mongoSanitize(req.query);
  }
  next();
});

// Set up Swagger documentation
swaggerDocs(app);

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  // Close server & exit process
  process.exit(1);
}); 