# HomeGuardian Backend

## Features

- User authentication and authorization
- Password reset functionality
- JWT-based session management
- Task management system
- Maintenance plan generation
- Reminder system
- Stripe integration for payments
- Secure API endpoints
- Rate limiting and request throttling
- Error logging and monitoring
- MongoDB database integration
- Swagger API documentation

## Tech Stack

- Node.js and Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Nodemailer for password reset emails
- OpenAI API for maintenance plan generation
- Stripe API for payment processing
- Winston for logging
- Swagger for API documentation
- Various security packages (helmet, cors, etc.)

## API Endpoints

### Authentication Routes
- **POST /api/auth/register**: Register new user
- **POST /api/auth/login**: Login user
- **POST /api/auth/refresh**: Refresh access token
- **POST /api/auth/logout**: Logout user
- **POST /api/auth/forgot-password**: Request password reset
- **POST /api/auth/reset-password/:token**: Reset password
- **GET /api/auth/me**: Get current user

### Home Routes
- **POST /api/homes**: Create new home
- **GET /api/homes**: Get all homes for user
- **GET /api/homes/:id**: Get specific home
- **PUT /api/homes/:id**: Update home
- **DELETE /api/homes/:id**: Delete home

### Task Routes
- **GET /api/tasks**: Get all tasks for user
- **GET /api/tasks/:id**: Get specific task
- **PUT /api/tasks/:id**: Update task
- **DELETE /api/tasks/:id**: Delete task

### Subscription Routes
- **POST /api/subscription/create**: Create subscription
- **POST /api/subscription/cancel**: Cancel subscription
- **GET /api/subscription/status**: Get subscription status

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- XSS protection
- NoSQL injection prevention
- Security headers with Helmet
- HTTPS enforcement in production
- Secure cookie usage
- Input validation and sanitization

## Error Handling

- Global error handler
- Custom error classes
- Detailed error logging
- Graceful error responses
- Rate limit error handling
- Validation error handling
- Database error handling
- API error handling

## Logging

- Request logging
- Error logging
- Security event logging
- Performance monitoring
- API usage tracking
- Database operation logging
- Authentication logging

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Start development server: `npm run dev`

## Production

1. Set all production environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`

## Environment Variables

Required environment variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_FROM=your_email
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Testing

Run tests with: `npm test`

## Documentation

API documentation available at `/api-docs` when running the server. 