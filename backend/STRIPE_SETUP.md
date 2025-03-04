# Stripe Integration Setup for HomeGuardian

This document provides instructions for setting up and testing the Stripe integration for subscription management in HomeGuardian.

## Prerequisites

1. A Stripe account (you can create one at [stripe.com](https://stripe.com))
2. Stripe CLI installed (for webhook testing)

## Setup Steps

### 1. Create a Product and Price in Stripe Dashboard

1. Log in to your Stripe Dashboard
2. Navigate to Products > Create Product
3. Create a product with the following details:
   - Name: HomeGuardian Premium
   - Description: Premium subscription for HomeGuardian
   - Price: $9.00 USD / month (recurring)
4. Save the product and note the Price ID (starts with `price_`)

### 2. Configure Environment Variables

Add the following environment variables to your `.env` file:

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID=your_stripe_price_id_for_9_dollar_subscription
```

- `STRIPE_SECRET_KEY`: Find this in the Stripe Dashboard under Developers > API keys
- `STRIPE_PRICE_ID`: The Price ID you noted in step 1
- `STRIPE_WEBHOOK_SECRET`: You'll get this when setting up the webhook in the next step

### 3. Set Up Webhook Endpoint

#### For Local Development:

1. Install the Stripe CLI from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Login to your Stripe account via CLI:
   ```
   stripe login
   ```
3. Start forwarding events to your local server:
   ```
   stripe listen --forward-to http://localhost:5000/api/subscriptions/stripe-webhook
   ```
4. The CLI will display a webhook signing secret. Add this to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

#### For Production:

1. In the Stripe Dashboard, go to Developers > Webhooks > Add Endpoint
2. Enter your webhook URL (e.g., `https://your-app.herokuapp.com/api/subscriptions/stripe-webhook`)
3. Select the following events to listen for:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `customer.subscription.trial_will_end`
4. After creating the webhook, reveal and copy the signing secret
5. Add this signing secret to your production environment variables as `STRIPE_WEBHOOK_SECRET`

### 4. Configure Customer Portal (Optional)

If you want to use the Stripe Customer Portal for subscription management:

1. In the Stripe Dashboard, go to Settings > Customer Portal
2. Configure the branding, features, and products available in the portal
3. Save your settings

## API Endpoints

### Subscription Management

- **POST /api/subscriptions/subscribe**: Create a new subscription
- **POST /api/subscriptions/cancel**: Cancel an existing subscription
- **GET /api/subscriptions/status**: Get basic subscription status
- **GET /api/subscriptions/details**: Get detailed subscription information including payment method and invoice history

### Payment Method Management

- **GET /api/subscriptions/payment-methods**: Get all payment methods for the user
- **POST /api/subscriptions/setup-intent**: Create a setup intent for securely collecting payment method details
- **POST /api/subscriptions/update-payment-method**: Update the default payment method for a subscription
- **DELETE /api/subscriptions/payment-methods/:id**: Delete a payment method

### Plan Management

- **POST /api/subscriptions/change-plan**: Change the subscription to a different plan (for future use when multiple plans are available)

### Checkout and Customer Portal

- **POST /api/subscriptions/create-checkout-session**: Create a Stripe Checkout session for subscription payment
- **POST /api/subscriptions/create-portal-session**: Create a Stripe Customer Portal session for subscription management

## Integration Options

HomeGuardian offers multiple ways to integrate Stripe subscriptions:

### Option 1: Direct API Integration

Use the `/api/subscriptions/subscribe` endpoint to create subscriptions directly from your application. This gives you the most control over the user experience but requires more implementation work.

### Option 2: Stripe Checkout

Use the `/api/subscriptions/create-checkout-session` endpoint to redirect users to Stripe's hosted checkout page. This is the easiest way to get started and provides a secure, optimized payment flow.

### Option 3: Stripe Customer Portal

Use the `/api/subscriptions/create-portal-session` endpoint to redirect users to Stripe's customer portal for subscription management. This allows users to update payment methods, view invoices, and manage their subscription without you having to build these features.

## Testing the Integration

### Test Subscription Creation

1. Make a POST request to `/api/subscriptions/subscribe` with a valid authentication token
2. The API will create a Stripe customer (if one doesn't exist) and a subscription
3. Check the user's subscription status with GET `/api/subscriptions/status`

### Test Subscription Cancellation

1. Make a POST request to `/api/subscriptions/cancel` with a valid authentication token
2. The API will cancel the subscription in Stripe and update the user's status
3. Verify the cancellation with GET `/api/subscriptions/status`

### Test Payment Method Update

1. Make a POST request to `/api/subscriptions/setup-intent` to get a client secret
2. Use the client secret with Stripe.js on the frontend to securely collect payment details
3. Send the payment method ID to `/api/subscriptions/update-payment-method`
4. Verify the update with GET `/api/subscriptions/details`

### Test Checkout Session

1. Make a POST request to `/api/subscriptions/create-checkout-session` with success and cancel URLs
2. Open the returned checkout URL in a browser
3. Complete the checkout process
4. Verify the subscription was created with GET `/api/subscriptions/status`

### Test Customer Portal

1. Make a POST request to `/api/subscriptions/create-portal-session` with a return URL
2. Open the returned portal URL in a browser
3. Make changes to the subscription in the portal
4. Verify the changes with GET `/api/subscriptions/details`

### Test Webhook Events

1. Use the Stripe CLI to trigger test events:
   ```
   stripe trigger invoice.payment_succeeded
   stripe trigger invoice.payment_failed
   stripe trigger customer.subscription.deleted
   stripe trigger customer.subscription.updated
   stripe trigger customer.subscription.trial_will_end
   ```
2. Check the application logs to verify that the events were processed correctly
3. Verify that the user's subscription status is updated accordingly

## Troubleshooting

- Check the application logs for detailed error messages
- Verify that all environment variables are set correctly
- Ensure that the Stripe CLI is forwarding events to the correct endpoint
- Check the Stripe Dashboard for event logs and webhook delivery status

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe.js and Elements](https://stripe.com/docs/js)
- [Stripe Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal Guide](https://stripe.com/docs/billing/subscriptions/customer-portal) 