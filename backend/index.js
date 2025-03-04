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

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize reminder service
initReminderService();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://homeguardian.vercel.app',
  credentials: true
}));

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
app.use('/', routes);

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