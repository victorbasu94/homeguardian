#!/bin/bash

# Test Stripe Webhook Script for HomeGuardian
# This script helps test the Stripe webhook integration

# Check if stripe CLI is installed
if ! command -v stripe &> /dev/null
then
    echo "Stripe CLI is not installed. Please install it first."
    echo "Visit https://stripe.com/docs/stripe-cli for installation instructions."
    exit 1
fi

# Check if the user is logged in to Stripe
stripe whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "You are not logged in to Stripe. Please run 'stripe login' first."
    exit 1
fi

# Default webhook URL
DEFAULT_URL="http://localhost:5000/api/subscriptions/stripe-webhook"
WEBHOOK_URL=${1:-$DEFAULT_URL}

echo "Starting Stripe webhook forwarding to $WEBHOOK_URL"
echo "Press Ctrl+C to stop"
echo ""
echo "In a separate terminal, you can trigger test events with:"
echo "stripe trigger invoice.payment_succeeded"
echo "stripe trigger invoice.payment_failed"
echo "stripe trigger customer.subscription.deleted"
echo "stripe trigger customer.subscription.updated"
echo "stripe trigger customer.subscription.trial_will_end"
echo ""

# Start forwarding webhook events
stripe listen --forward-to $WEBHOOK_URL 