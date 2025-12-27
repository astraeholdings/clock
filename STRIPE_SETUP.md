# Stripe Setup Guide for clocko

This guide walks you through setting up Stripe for clocko's $8/month subscription with a 7-day free trial.

## 1. Create Stripe Account

1. Go to https://stripe.com
2. Sign up for an account
3. Complete account setup

## 2. Get API Keys

### Development Keys (Test Mode)

1. In Stripe Dashboard, ensure you're in **Test Mode** (toggle in top-right)
2. Go to **Developers > API keys**
3. Copy these keys:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Production Keys

1. Complete Stripe onboarding and activate your account
2. Switch to **Live Mode**
3. Go to **Developers > API keys**
4. Copy the live keys (same variables as above)

## 3. Configure Webhooks

### Local Development

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe

   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret from the output:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```

5. Add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### Production

1. In Stripe Dashboard, go to **Developers > Webhooks**

2. Click **Add endpoint**

3. Configure the endpoint:
   - **Endpoint URL**: `https://your-vercel-domain.com/api/webhooks/stripe`
   - **Description**: clocko production webhooks
   - **Events to send**: Select these specific events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`

4. Click **Add endpoint**

5. Click on the newly created endpoint to view details

6. Copy the **Signing secret** (starts with `whsec_`)

7. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx_production
   ```

## 4. Test the Integration

### Test Subscription Flow

1. Start your local server:
   ```bash
   npm run dev
   ```

2. In another terminal, start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Go to http://localhost:3000 and sign up

4. Navigate to Billing and click "Start 7-Day Free Trial"

5. Use test card:
   - Card number: `4242 4242 4242 4242`
   - Expiration: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

6. Complete checkout

7. Verify:
   - You're redirected to dashboard
   - Subscription shows as "Active" in billing page
   - Check Stripe Dashboard > Customers to see the new customer
   - Check webhook logs to see events received

### Test Subscription Cancellation

1. In billing page, click "Manage Subscription"
2. Cancel the subscription
3. Verify app becomes read-only

### Test Payment Failure

1. Create a new subscription with test card: `4000 0000 0000 0341`
2. This card will fail on subsequent payment attempts
3. Verify subscription status updates correctly

## 5. Webhook Events Explained

- **customer.subscription.created**: Fired when subscription is created
  - Updates user's subscription status to active
  - Sets trial end date

- **customer.subscription.updated**: Fired when subscription is modified
  - Updates subscription status
  - Handles trial expiration

- **customer.subscription.deleted**: Fired when subscription is canceled
  - Sets subscription status to inactive
  - App becomes read-only for user

- **invoice.payment_failed**: Fired when payment fails
  - Sets subscription status to past_due
  - User sees warning in app

- **invoice.payment_succeeded**: Fired when payment succeeds
  - Reactivates subscription if it was past_due
  - Sent after trial ends and first payment

## 6. Monitoring Webhooks

### View Webhook Logs

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click on your endpoint
3. View **Recent deliveries** tab
4. Check for failed deliveries and retry if needed

### Common Webhook Issues

**Webhook failing with 401/403**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check that endpoint URL is correct

**Webhook timeout**
- Ensure your server responds within 5 seconds
- Move long-running tasks to background jobs

**Signature verification failed**
- Secret might be wrong
- Clock skew (server time is off)

## 7. Stripe Customer Portal

The app uses Stripe's hosted customer portal for:
- Viewing subscription details
- Updating payment method
- Canceling subscription
- Viewing billing history

This is automatically configured when creating the portal session in `app/actions/stripe.ts`.

## 8. Going Live

Before accepting real payments:

1. **Complete Stripe onboarding**
   - Verify business details
   - Add bank account for payouts

2. **Switch to live mode**
   - Get live API keys
   - Update environment variables in Vercel

3. **Set up production webhook**
   - Follow production webhook steps above
   - Test with live mode test cards first

4. **Enable payment methods**
   - Go to Settings > Payment methods
   - Enable cards (enabled by default)
   - Optional: Enable Apple Pay, Google Pay, etc.

5. **Configure email receipts**
   - Go to Settings > Emails
   - Customize receipt emails
   - Add your logo

## 9. Pricing Configuration

The current pricing is hardcoded in `app/actions/stripe.ts`:

```typescript
line_items: [
  {
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'clocko Pro',
        description: 'Time tracking for freelancers',
      },
      unit_amount: 800, // $8.00 in cents
      recurring: {
        interval: 'month',
      },
    },
    quantity: 1,
  },
],
subscription_data: {
  trial_period_days: 7,
},
```

To change pricing:
- Modify `unit_amount` (in cents)
- Modify `trial_period_days`
- Update marketing copy to match

## 10. Testing Checklist

- [ ] User can start free trial
- [ ] Trial end date is set correctly (7 days from now)
- [ ] User has full access during trial
- [ ] Subscription becomes active after trial
- [ ] Failed payment sets status to past_due
- [ ] App becomes read-only when subscription inactive
- [ ] User can manage subscription via portal
- [ ] Cancellation works correctly
- [ ] Webhooks are received and processed
- [ ] Customer shows up in Stripe Dashboard

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
