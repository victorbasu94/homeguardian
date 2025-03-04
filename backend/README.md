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
- **Authentication System**:
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing with bcrypt
  - Email verification
  - Password reset functionality
  - Rate limiting for sensitive routes
- **AI-Driven Maintenance Plans**:
  - Automatic generation of personalized maintenance tasks based on home characteristics
  - Rule-based system for determining appropriate maintenance schedules
  - Configurable task rules without code changes
  - Prevention of duplicate tasks

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- Email service for verification and password reset emails

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
   Then edit the `.env` file with your MongoDB connection string, JWT secrets, and email configuration.

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

## Authentication Endpoints

The backend provides the following authentication endpoints:

- **POST /api/auth/register**: Register a new user
- **GET /api/auth/verify/:token**: Verify user email
- **POST /api/auth/login**: Login user and get access token
- **POST /api/auth/refresh**: Refresh access token
- **POST /api/auth/logout**: Logout user
- **POST /api/auth/forgot-password**: Request password reset
- **POST /api/auth/reset-password/:token**: Reset password
- **GET /api/auth/me**: Get current user information

## Project Structure

```
backend/
├── config/         # Configuration files
│   ├── db.js       # Database configuration
│   ├── swagger.js  # API documentation config
│   └── tasks.json  # Maintenance task rules
├── controllers/    # Route controllers
├── logs/           # Application logs
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── services/       # Service modules
│   ├── emailService.js      # Email functionality
│   └── maintenanceService.js # AI maintenance plan generation
├── utils/          # Utility functions
├── .env.example    # Example environment variables
├── index.js        # Application entry point
└── README.md       # This file
```

## Security Considerations

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Passwords are hashed using bcrypt with 12 salt rounds
- Email verification is required before login
- Rate limiting is applied to login and password reset routes
- Refresh tokens are stored in HttpOnly cookies
- All sensitive routes are protected with JWT verification

## AI-Driven Maintenance Plans

The system includes an intelligent maintenance plan generator that creates personalized maintenance tasks for homes based on their characteristics.

### How It Works

1. When a new home is created, the system automatically analyzes its attributes (year built, roof type, HVAC system, etc.)
2. Based on configurable rules, it generates appropriate maintenance tasks with due dates
3. Tasks are stored in the database and associated with the specific home
4. The system prevents duplicate tasks from being created

### Task Rules Configuration

Task rules are stored in `config/tasks.json` and can be modified without changing code. Each rule has:

- **Condition**: Property to check, operator, and value to compare against
- **Task**: Name, frequency, and explanation of why the task is important

Example rule format:
```json
{
  "condition": {
    "property": "year_built",
    "operator": "<",
    "value": 2000
  },
  "task": {
    "task_name": "Inspect Foundation",
    "frequency": "yearly",
    "why": "Older homes may have foundation issues that need regular inspection"
  }
}
```

### Adding New Rules

To add new maintenance rules:

1. Edit `config/tasks.json`
2. Add a new rule object to the `rules` array
3. Restart the server to apply changes

The system supports various operators (`<`, `>`, `<=`, `>=`, `===`, `!==`) and can handle different frequency formats (yearly, 6 months, etc.).

## License

MIT 