const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const stripeService = require('../services/stripeService');
const logger = require('../utils/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @swagger
 * /api/subscriptions/subscribe:
 *   post:
 *     summary: Subscribe to the premium plan
 *     description: Creates a Stripe customer and subscription for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription activated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Create a Stripe customer if one doesn't exist
    if (!user.stripe_customer_id) {
      const customerId = await stripeService.createCustomer(user.email);
      user.stripe_customer_id = customerId;
    }
    
    // Create a subscription
    const subscription = await stripeService.createSubscription(user.stripe_customer_id);
    
    // Update user's subscription status
    user.subscription_status = 'active';
    await user.save();
    
    logger.info(`Subscription activated for user: ${user.id}`);
    
    return res.status(200).json({
      status: 'success',
      message: 'Subscription activated',
      data: {
        subscription_id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000)
      }
    });
  } catch (error) {
    logger.error(`Error activating subscription: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to activate subscription',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancel subscription
 *     description: Cancels the user's active subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription canceled successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User or subscription not found
 *       500:
 *         description: Server error
 */
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has an active subscription
    if (user.subscription_status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'No active subscription found'
      });
    }
    
    // Get the user's subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No active subscription found in Stripe'
      });
    }
    
    // Cancel the subscription
    const subscriptionId = subscriptions.data[0].id;
    await stripeService.cancelSubscription(subscriptionId);
    
    // Update user's subscription status
    user.subscription_status = 'canceled';
    await user.save();
    
    logger.info(`Subscription canceled for user: ${user.id}`);
    
    return res.status(200).json({
      status: 'success',
      message: 'Subscription canceled'
    });
  } catch (error) {
    logger.error(`Error canceling subscription: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/stripe-webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     description: Handles Stripe webhook events
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 *       500:
 *         description: Server error
 */
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing Stripe signature'
      });
    }
    
    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(req.body, signature);
    
    // Handle different event types
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(event.data.object);
        break;
        
      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Error processing Stripe webhook: ${error.message}`, { error });
    
    return res.status(400).json({
      status: 'error',
      message: 'Webhook Error',
      error: error.message
    });
  }
});

/**
 * Handle invoice.payment_succeeded event
 * @param {Object} invoice - Stripe invoice object
 */
const handleInvoicePaymentSucceeded = async (invoice) => {
  try {
    if (invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_cycle') {
      const customerId = invoice.customer;
      
      // Find the user with this Stripe customer ID
      const user = await User.findOne({ stripe_customer_id: customerId });
      
      if (user) {
        // Ensure subscription status is active
        if (user.subscription_status !== 'active') {
          user.subscription_status = 'active';
          await user.save();
          
          logger.info(`User ${user.id} subscription status updated to active after payment`);
        }
      } else {
        logger.warn(`No user found with Stripe customer ID: ${customerId}`);
      }
    }
  } catch (error) {
    logger.error(`Error handling invoice.payment_succeeded: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Handle invoice.payment_failed event
 * @param {Object} invoice - Stripe invoice object
 */
const handleInvoicePaymentFailed = async (invoice) => {
  try {
    const customerId = invoice.customer;
    
    // Find the user with this Stripe customer ID
    const user = await User.findOne({ stripe_customer_id: customerId });
    
    if (user) {
      // Log the payment failure but don't change subscription status yet
      // Stripe will retry the payment according to its retry schedule
      logger.warn(`Payment failed for user ${user.id}, invoice ${invoice.id}`);
      
      // If this is the final payment attempt, you might want to update the status
      if (invoice.next_payment_attempt === null) {
        logger.warn(`Final payment attempt failed for user ${user.id}`);
        // You could update the status here if desired
      }
    } else {
      logger.warn(`No user found with Stripe customer ID: ${customerId}`);
    }
  } catch (error) {
    logger.error(`Error handling invoice.payment_failed: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Handle customer.subscription.deleted event
 * @param {Object} subscription - Stripe subscription object
 */
const handleSubscriptionDeleted = async (subscription) => {
  try {
    const customerId = subscription.customer;
    
    // Find the user with this Stripe customer ID
    const user = await User.findOne({ stripe_customer_id: customerId });
    
    if (user) {
      // Update subscription status to canceled
      user.subscription_status = 'canceled';
      await user.save();
      
      logger.info(`User ${user.id} subscription status updated to canceled after subscription deletion`);
    } else {
      logger.warn(`No user found with Stripe customer ID: ${customerId}`);
    }
  } catch (error) {
    logger.error(`Error handling customer.subscription.deleted: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Handle customer.subscription.updated event
 * @param {Object} subscription - Stripe subscription object
 */
const handleSubscriptionUpdated = async (subscription) => {
  try {
    const customerId = subscription.customer;
    
    // Find the user with this Stripe customer ID
    const user = await User.findOne({ stripe_customer_id: customerId });
    
    if (user) {
      // Update subscription status based on the subscription status from Stripe
      if (subscription.status === 'active' && user.subscription_status !== 'active') {
        user.subscription_status = 'active';
        await user.save();
        logger.info(`User ${user.id} subscription status updated to active after subscription update`);
      } else if (subscription.status === 'canceled' && user.subscription_status !== 'canceled') {
        user.subscription_status = 'canceled';
        await user.save();
        logger.info(`User ${user.id} subscription status updated to canceled after subscription update`);
      } else if (subscription.status === 'past_due') {
        // You might want to notify the user or take other actions for past_due subscriptions
        logger.warn(`User ${user.id} subscription is past due`);
      }
    } else {
      logger.warn(`No user found with Stripe customer ID: ${customerId}`);
    }
  } catch (error) {
    logger.error(`Error handling customer.subscription.updated: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Handle customer.subscription.trial_will_end event
 * @param {Object} subscription - Stripe subscription object
 */
const handleSubscriptionTrialWillEnd = async (subscription) => {
  try {
    const customerId = subscription.customer;
    
    // Find the user with this Stripe customer ID
    const user = await User.findOne({ stripe_customer_id: customerId });
    
    if (user) {
      // This is where you would notify the user that their trial is ending soon
      logger.info(`Trial ending soon for user ${user.id}`);
      
      // You could send an email notification here using your email service
    } else {
      logger.warn(`No user found with Stripe customer ID: ${customerId}`);
    }
  } catch (error) {
    logger.error(`Error handling customer.subscription.trial_will_end: ${error.message}`, { error });
    throw error;
  }
};

/**
 * @swagger
 * /api/subscriptions/status:
 *   get:
 *     summary: Get subscription status
 *     description: Returns the user's current subscription status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get subscription details if user has a Stripe customer ID
    let subscriptionDetails = null;
    
    if (user.stripe_customer_id && user.subscription_status === 'active') {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'active',
          limit: 1,
          expand: ['data.default_payment_method']
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          subscriptionDetails = {
            id: subscription.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end
          };
        }
      } catch (stripeError) {
        logger.error(`Error fetching subscription from Stripe: ${stripeError.message}`, { error: stripeError });
        // Continue without subscription details
      }
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        subscription_status: user.subscription_status,
        subscription_details: subscriptionDetails
      }
    });
  } catch (error) {
    logger.error(`Error getting subscription status: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get subscription status',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/details:
 *   get:
 *     summary: Get detailed subscription information
 *     description: Returns detailed information about the user's subscription including payment method and billing history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/details', verifyToken, async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return res.status(200).json({
        status: 'success',
        data: {
          has_subscription: false,
          message: 'User does not have a subscription'
        }
      });
    }
    
    // Get subscription details from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      limit: 5,
      expand: ['data.default_payment_method']
    });
    
    // Get invoice history
    const invoices = await stripe.invoices.list({
      customer: user.stripe_customer_id,
      limit: 10
    });
    
    // Format subscription data
    const formattedSubscriptions = subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      current_period_start: new Date(sub.current_period_start * 1000),
      current_period_end: new Date(sub.current_period_end * 1000),
      cancel_at_period_end: sub.cancel_at_period_end,
      created: new Date(sub.created * 1000),
      payment_method: sub.default_payment_method ? {
        brand: sub.default_payment_method.card.brand,
        last4: sub.default_payment_method.card.last4,
        exp_month: sub.default_payment_method.card.exp_month,
        exp_year: sub.default_payment_method.card.exp_year
      } : null
    }));
    
    // Format invoice data
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount_paid: invoice.amount_paid / 100, // Convert from cents to dollars
      status: invoice.status,
      created: new Date(invoice.created * 1000),
      invoice_pdf: invoice.invoice_pdf
    }));
    
    return res.status(200).json({
      status: 'success',
      data: {
        has_subscription: formattedSubscriptions.length > 0,
        subscriptions: formattedSubscriptions,
        invoices: formattedInvoices
      }
    });
  } catch (error) {
    logger.error(`Error getting subscription details: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get subscription details',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/setup-intent:
 *   post:
 *     summary: Create a setup intent for updating payment method
 *     description: Creates a Stripe setup intent for securely collecting payment method details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setup intent created successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/setup-intent', verifyToken, async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      // Create a new customer
      const customerId = await stripeService.createCustomer(user.email);
      user.stripe_customer_id = customerId;
      await user.save();
    }
    
    // Create a setup intent
    const setupIntent = await stripeService.createSetupIntent(user.stripe_customer_id);
    
    return res.status(200).json({
      status: 'success',
      data: {
        client_secret: setupIntent.client_secret
      }
    });
  } catch (error) {
    logger.error(`Error creating setup intent: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create setup intent',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/update-payment-method:
 *   post:
 *     summary: Update payment method
 *     description: Updates the default payment method for the user's subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_method_id
 *             properties:
 *               payment_method_id:
 *                 type: string
 *                 description: Stripe payment method ID
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 *       400:
 *         description: Invalid request - Missing payment method ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/update-payment-method', verifyToken, async (req, res) => {
  try {
    const { payment_method_id } = req.body;
    
    if (!payment_method_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment method ID is required'
      });
    }
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User does not have a Stripe customer ID'
      });
    }
    
    // Update the default payment method
    await stripeService.updateDefaultPaymentMethod(user.stripe_customer_id, payment_method_id);
    
    return res.status(200).json({
      status: 'success',
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating payment method: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update payment method',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/change-plan:
 *   post:
 *     summary: Change subscription plan
 *     description: Updates the user's subscription to a different plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan_id
 *             properties:
 *               plan_id:
 *                 type: string
 *                 description: Stripe price ID for the new plan
 *     responses:
 *       200:
 *         description: Subscription plan changed successfully
 *       400:
 *         description: Invalid request - Missing plan ID or no active subscription
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/change-plan', verifyToken, async (req, res) => {
  try {
    const { plan_id } = req.body;
    
    if (!plan_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Plan ID is required'
      });
    }
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has an active subscription
    if (user.subscription_status !== 'active' || !user.stripe_customer_id) {
      return res.status(400).json({
        status: 'error',
        message: 'No active subscription found'
      });
    }
    
    // Get the user's active subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No active subscription found in Stripe'
      });
    }
    
    // Update the subscription plan
    const subscriptionId = subscriptions.data[0].id;
    const updatedSubscription = await stripeService.updateSubscriptionPlan(subscriptionId, plan_id);
    
    return res.status(200).json({
      status: 'success',
      message: 'Subscription plan changed successfully',
      data: {
        subscription_id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_end: new Date(updatedSubscription.current_period_end * 1000)
      }
    });
  } catch (error) {
    logger.error(`Error changing subscription plan: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to change subscription plan',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/payment-methods:
 *   get:
 *     summary: Get user's payment methods
 *     description: Returns all payment methods associated with the user's Stripe account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/payment-methods', verifyToken, async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return res.status(200).json({
        status: 'success',
        data: {
          payment_methods: []
        }
      });
    }
    
    // Get payment methods from Stripe
    const paymentMethods = await stripeService.getCustomerPaymentMethods(user.stripe_customer_id);
    
    // Format payment method data
    const formattedPaymentMethods = paymentMethods.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      exp_month: pm.card.exp_month,
      exp_year: pm.card.exp_year,
      is_default: pm.metadata.is_default === 'true'
    }));
    
    return res.status(200).json({
      status: 'success',
      data: {
        payment_methods: formattedPaymentMethods
      }
    });
  } catch (error) {
    logger.error(`Error getting payment methods: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get payment methods',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/payment-methods/{id}:
 *   delete:
 *     summary: Delete a payment method
 *     description: Deletes a payment method from the user's Stripe account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe payment method ID
 *     responses:
 *       200:
 *         description: Payment method deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User or payment method not found
 *       500:
 *         description: Server error
 */
router.delete('/payment-methods/:id', verifyToken, async (req, res) => {
  try {
    const paymentMethodId = req.params.id;
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return res.status(404).json({
        status: 'error',
        message: 'User does not have a Stripe customer ID'
      });
    }
    
    // Verify the payment method belongs to this customer
    const paymentMethods = await stripeService.getCustomerPaymentMethods(user.stripe_customer_id);
    const paymentMethodExists = paymentMethods.some(pm => pm.id === paymentMethodId);
    
    if (!paymentMethodExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment method not found or does not belong to this user'
      });
    }
    
    // Delete the payment method
    await stripeService.deletePaymentMethod(paymentMethodId);
    
    return res.status(200).json({
      status: 'success',
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting payment method: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete payment method',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/create-checkout-session:
 *   post:
 *     summary: Create a checkout session
 *     description: Creates a Stripe checkout session for subscription payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - success_url
 *               - cancel_url
 *             properties:
 *               success_url:
 *                 type: string
 *                 description: URL to redirect to on successful payment
 *               cancel_url:
 *                 type: string
 *                 description: URL to redirect to if user cancels
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *       400:
 *         description: Invalid request - Missing required parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { success_url, cancel_url } = req.body;
    
    if (!success_url || !cancel_url) {
      return res.status(400).json({
        status: 'error',
        message: 'Success URL and cancel URL are required'
      });
    }
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Create a Stripe customer if one doesn't exist
    if (!user.stripe_customer_id) {
      const customerId = await stripeService.createCustomer(user.email);
      user.stripe_customer_id = customerId;
      await user.save();
    }
    
    // Set success and cancel URLs
    const successUrl = `${process.env.FRONTEND_URL}/dashboard?subscription=success`;
    const cancelUrl = `${process.env.FRONTEND_URL}/plan-selection?subscription=canceled`;

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      user.stripe_customer_id,
      successUrl,
      cancelUrl
    );
    
    return res.status(200).json({
      status: 'success',
      data: {
        session_id: session.id,
        checkout_url: session.url
      }
    });
  } catch (error) {
    logger.error(`Error creating checkout session: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/create-portal-session:
 *   post:
 *     summary: Create a customer portal session
 *     description: Creates a Stripe customer portal session for managing subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - return_url
 *             properties:
 *               return_url:
 *                 type: string
 *                 description: URL to return to after the portal session
 *     responses:
 *       200:
 *         description: Portal session created successfully
 *       400:
 *         description: Invalid request - Missing return URL or no Stripe customer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/create-portal-session', verifyToken, async (req, res) => {
  try {
    const { return_url } = req.body;
    
    if (!return_url) {
      return res.status(400).json({
        status: 'error',
        message: 'Return URL is required'
      });
    }
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User does not have a Stripe customer ID'
      });
    }
    
    // Create a portal session
    const session = await stripeService.createPortalSession(
      user.stripe_customer_id,
      return_url
    );
    
    return res.status(200).json({
      status: 'success',
      data: {
        portal_url: session.url
      }
    });
  } catch (error) {
    logger.error(`Error creating portal session: ${error.message}`, { error });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create portal session',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/checkout:
 *   post:
 *     summary: Create a Stripe checkout session for subscription
 *     description: Creates a checkout session for the user to subscribe to a plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan_type
 *             properties:
 *               plan_type:
 *                 type: string
 *                 enum: [basic, pro, premium]
 *                 description: The subscription plan type
 *               billing_cycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 description: The billing cycle (defaults to monthly)
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { plan_type, billing_cycle = 'monthly' } = req.body;
    const userId = req.user.id;

    // Validate plan type
    if (!['basic', 'pro', 'premium'].includes(plan_type)) {
      return res.status(400).json({ message: 'Invalid plan type. Must be one of: basic, pro, premium' });
    }

    // Validate billing cycle
    if (!['monthly', 'yearly'].includes(billing_cycle)) {
      return res.status(400).json({ message: 'Invalid billing cycle. Must be one of: monthly, yearly' });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create Stripe customer if not exists
    if (!user.stripe_customer_id) {
      const customerId = await stripeService.createCustomer(user.email);
      user.stripe_customer_id = customerId;
      await user.save();
    }

    // Determine price ID based on plan and billing cycle
    let priceId = process.env.STRIPE_PRICE_ID; // Use the single price ID for now
    
    // Log the plan selection for future implementation
    logger.info(`Selected plan: ${plan_type}, billing cycle: ${billing_cycle}`);
    logger.info(`Using default price ID: ${priceId}`);

    // Check if price ID is valid
    if (!priceId || priceId === 'price_1234567890abcdefghijklmn' || priceId.includes('your_stripe_price_id')) {
      logger.error('Invalid Stripe price ID. Please set a valid STRIPE_PRICE_ID in the .env file.');
      return res.status(500).json({ 
        message: 'Stripe configuration error. Please contact support.',
        details: 'Invalid price ID configuration'
      });
    }

    // Set success and cancel URLs
    const successUrl = `${process.env.FRONTEND_URL}/dashboard?subscription=success`;
    const cancelUrl = `${process.env.FRONTEND_URL}/plan-selection?subscription=canceled`;

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      user.stripe_customer_id,
      priceId,
      successUrl,
      cancelUrl
    );

    logger.info(`Checkout session created for user ${userId}, plan: ${plan_type}, billing: ${billing_cycle}`);

    // Return checkout URL
    res.status(200).json({ checkout_url: session.url });
  } catch (error) {
    logger.error(`Error creating checkout session: ${error.message}`, { error });
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

module.exports = router; 