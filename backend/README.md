# HomeGuardian Backend

A secure and scalable Node.js/Express backend for the HomeGuardian application, integrated with MongoDB Atlas.

## Features

- Express.js framework with secure middleware setup
- MongoDB Atlas integration with connection retry logic
- Comprehensive logging with Winston
- API documentation with Swagger
- Security features:
  - Helmet for HTTP headers
  - CORS protection
  - Rate limiting
  - MongoDB sanitization
  - Express validator for input validation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account (or local MongoDB installation)

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/homeguardian.git
   cd homeguardian/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your MongoDB connection string and other configuration.

4. Start the server:
   ```
   node index.js
   ```
   
   For development with auto-restart:
   ```
   npm install -g nodemon
   nodemon index.js
   ```

## API Documentation

Once the server is running, you can access the API documentation at:
```
http://localhost:5000/api-docs
```

## Project Structure

```
backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── logs/           # Application logs
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions
├── .env.example    # Example environment variables
├── index.js        # Application entry point
└── README.md       # This file
```

## License

MIT 