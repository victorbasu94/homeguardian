# HomeGuardian Stripe Integration Frontend Example

This directory contains a simple HTML/JavaScript example that demonstrates how to integrate with the HomeGuardian Stripe subscription API.

## Getting Started

1. Open `stripe-integration.html` in a text editor
2. Replace the following values with your own:
   - `pk_test_your_publishable_key` with your Stripe publishable key
   - `your_auth_token` with a valid JWT token from the HomeGuardian API
   - Update the `API_BASE_URL` if your backend is not running on `http://localhost:5000`

3. Open the HTML file in a browser to test the integration

## Features Demonstrated

This example demonstrates the following features:

1. **Direct API Integration**: Creating a subscription directly through the API
2. **Payment Method Management**: Adding and updating payment methods
3. **Stripe Checkout**: Using Stripe's hosted checkout page
4. **Stripe Customer Portal**: Using Stripe's customer portal for subscription management
5. **Subscription Cancellation**: Canceling a subscription

## Implementation Details

### Authentication

The example uses a JWT token for authentication with the HomeGuardian API. In a real application, you would need to implement a proper authentication flow.

### Stripe Elements

The example uses Stripe Elements to securely collect payment information. This ensures that sensitive card data never touches your server.

### Error Handling

The example includes basic error handling for API calls and Stripe operations.

## Security Considerations

In a production environment, you should:

1. Never hardcode authentication tokens
2. Implement proper CSRF protection
3. Use HTTPS for all API calls
4. Validate all user inputs
5. Implement proper error handling and logging

## Additional Resources

- [Stripe.js Documentation](https://stripe.com/docs/js)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js/elements/quickstart)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal Documentation](https://stripe.com/docs/billing/subscriptions/customer-portal) 