// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize logger
const logger = require('../utils/logger');

// Mock Stripe implementation for development
let stripe;
if (isDevelopment) {
  logger.info('Using mock Stripe implementation for development');
  
  // Mock Stripe implementation
  stripe = {
    customers: {
      create: async (data) => {
        logger.info(`[MOCK] Creating customer with email: ${data.email}`);
        return { id: `cus_mock_${Date.now()}` };
      }
    },
    checkout: {
      sessions: {
        create: async (data) => {
          logger.info(`[MOCK] Creating checkout session for customer: ${data.customer}`);
          // In development, redirect to dashboard with success parameter
          const checkoutUrl = `${process.env.FRONTEND_URL}/dashboard?subscription=success&mock=true`;
          return { 
            id: `cs_mock_${Date.now()}`,
            url: checkoutUrl
          };
        }
      }
    },
    subscriptions: {
      create: async (data) => {
        logger.info(`[MOCK] Creating subscription for customer: ${data.customer}`);
        return { 
          id: `sub_mock_${Date.now()}`,
          status: 'active',
          customer: data.customer,
          items: {
            data: [{ price: { id: data.items[0].price } }]
          }
        };
      },
      cancel: async (subscriptionId) => {
        logger.info(`[MOCK] Cancelling subscription: ${subscriptionId}`);
        return { id: subscriptionId, status: 'canceled' };
      }
    },
    billingPortal: {
      sessions: {
        create: async (data) => {
          logger.info(`[MOCK] Creating billing portal session for customer: ${data.customer}`);
          return { url: data.return_url };
        }
      }
    }
  };
} else {
  // Use real Stripe in production
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key')) {
    console.error('ERROR: Stripe API key is not properly configured!');
    console.error('Please set a valid STRIPE_SECRET_KEY in your .env file');
  }
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  logger.info('Stripe service initialized with live API');
}

/**
 * Create a new Stripe customer
 * @param {string} email - Customer's email address
 * @returns {Promise<string>} - Stripe customer ID
 */
const createCustomer = async (email) => {
  try {
    logger.info(`Creating Stripe customer for email: ${email}`);
    const customer = await stripe.customers.create({
      email,
      description: `HomeGuardian customer - ${email}`
    });
    
    logger.info(`Stripe customer created successfully: ${customer.id}`);
    return customer.id;
  } catch (error) {
    logger.error(`Error creating Stripe customer: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Create a subscription for a customer
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} - Subscription object
 */
const createSubscription = async (customerId) => {
  try {
    logger.info(`Creating subscription for customer: ${customerId}`);
    
    // Create a subscription with the $9/month price
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID, // $9/month price ID from Stripe dashboard
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    logger.info(`Subscription created successfully: ${subscription.id}`);
    return subscription;
  } catch (error) {
    logger.error(`Error creating subscription: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} - Canceled subscription object
 */
const cancelSubscription = async (subscriptionId) => {
  try {
    logger.info(`Canceling subscription: ${subscriptionId}`);
    
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    
    logger.info(`Subscription canceled successfully: ${subscriptionId}`);
    return canceledSubscription;
  } catch (error) {
    logger.error(`Error canceling subscription: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Verify Stripe webhook signature
 * @param {string} payload - Request body as string
 * @param {string} signature - Stripe signature from headers
 * @returns {Promise<Object>} - Event object
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    logger.info('Verifying Stripe webhook signature');
    
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    logger.info(`Webhook signature verified for event: ${event.id}`);
    return event;
  } catch (error) {
    logger.error(`Webhook signature verification failed: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Create a setup intent for updating payment method
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} - Setup intent object
 */
const createSetupIntent = async (customerId) => {
  try {
    logger.info(`Creating setup intent for customer: ${customerId}`);
    
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
    
    logger.info(`Setup intent created successfully: ${setupIntent.id}`);
    return setupIntent;
  } catch (error) {
    logger.error(`Error creating setup intent: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update the default payment method for a customer
 * @param {string} customerId - Stripe customer ID
 * @param {string} paymentMethodId - Stripe payment method ID
 * @returns {Promise<Object>} - Updated customer object
 */
const updateDefaultPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    logger.info(`Updating default payment method for customer: ${customerId}`);
    
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set as default payment method
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    logger.info(`Default payment method updated successfully for customer: ${customerId}`);
    return customer;
  } catch (error) {
    logger.error(`Error updating default payment method: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update subscription plan
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {string} newPriceId - New Stripe price ID
 * @returns {Promise<Object>} - Updated subscription object
 */
const updateSubscriptionPlan = async (subscriptionId, newPriceId) => {
  try {
    logger.info(`Updating subscription plan: ${subscriptionId} to price: ${newPriceId}`);
    
    // Get the subscription to find the current items
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
    
    logger.info(`Subscription plan updated successfully: ${subscriptionId}`);
    return updatedSubscription;
  } catch (error) {
    logger.error(`Error updating subscription plan: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get customer payment methods
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Array>} - Array of payment methods
 */
const getCustomerPaymentMethods = async (customerId) => {
  try {
    logger.info(`Retrieving payment methods for customer: ${customerId}`);
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    logger.info(`Retrieved ${paymentMethods.data.length} payment methods for customer: ${customerId}`);
    return paymentMethods.data;
  } catch (error) {
    logger.error(`Error retrieving payment methods: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Delete a payment method
 * @param {string} paymentMethodId - Stripe payment method ID
 * @returns {Promise<Object>} - Deleted payment method
 */
const deletePaymentMethod = async (paymentMethodId) => {
  try {
    logger.info(`Deleting payment method: ${paymentMethodId}`);
    
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    
    logger.info(`Payment method deleted successfully: ${paymentMethodId}`);
    return paymentMethod;
  } catch (error) {
    logger.error(`Error deleting payment method: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Create a checkout session for subscription
 * @param {string} customerId - Stripe customer ID
 * @param {string} priceId - Stripe price ID
 * @param {string} successUrl - URL to redirect to on success
 * @param {string} cancelUrl - URL to redirect to on cancel
 * @returns {Promise<Object>} - Checkout session
 */
const createCheckoutSession = async (customerId, priceId, successUrl, cancelUrl) => {
  try {
    logger.info(`Creating checkout session for customer: ${customerId}, price: ${priceId}`);
    
    // Validate inputs
    if (!customerId) {
      const error = new Error('Customer ID is required');
      logger.error(`Checkout session creation failed: ${error.message}`);
      throw error;
    }
    
    if (!priceId) {
      const error = new Error('Price ID is required');
      logger.error(`Checkout session creation failed: ${error.message}`);
      throw error;
    }
    
    if (!successUrl || !cancelUrl) {
      const error = new Error('Success URL and cancel URL are required');
      logger.error(`Checkout session creation failed: ${error.message}`);
      throw error;
    }
    
    // Log the checkout session parameters
    logger.info(`Creating checkout with params: 
      - Customer ID: ${customerId}
      - Price ID: ${priceId}
      - Success URL: ${successUrl}
      - Cancel URL: ${cancelUrl}`);
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });
    
    logger.info(`Checkout session created successfully: ${session.id}`);
    return session;
  } catch (error) {
    // Check for specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      if (error.param === 'price') {
        logger.error(`Invalid Stripe price ID: ${priceId}`, { error });
        throw new Error(`Invalid price ID: ${priceId}. Please check your Stripe configuration.`);
      }
    }
    
    // Log the full error for debugging
    logger.error(`Error creating checkout session: ${error.message}`, { 
      error,
      customerId,
      priceId,
      errorType: error.type,
      errorCode: error.code,
      errorParam: error.param
    });
    
    // Rethrow with a more descriptive message
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

/**
 * Create a customer portal session
 * @param {string} customerId - Stripe customer ID
 * @param {string} returnUrl - URL to return to after the portal session
 * @returns {Promise<Object>} - Portal session
 */
const createPortalSession = async (customerId, returnUrl) => {
  try {
    logger.info(`Creating customer portal session for customer: ${customerId}`);
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    logger.info(`Customer portal session created successfully: ${session.id}`);
    return session;
  } catch (error) {
    logger.error(`Error creating customer portal session: ${error.message}`, { error });
    throw error;
  }
};

module.exports = {
  createCustomer,
  createSubscription,
  cancelSubscription,
  verifyWebhookSignature,
  createSetupIntent,
  updateDefaultPaymentMethod,
  updateSubscriptionPlan,
  getCustomerPaymentMethods,
  deletePaymentMethod,
  createCheckoutSession,
  createPortalSession
}; 