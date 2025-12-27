# Deployment Guide for clocko

This guide covers deploying clocko to Vercel with Supabase and Stripe in production.

## Prerequisites

- GitHub account
- Vercel account
- Production Supabase project
- Stripe account (activated for live mode)

## Step 1: Prepare Supabase for Production

### Create Production Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Choose organization and region (choose closest to your users)
4. Set database password (save this securely!)
5. Wait for project to be created

### Run Database Migration

1. Go to SQL Editor in your new project
2. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL
4. Verify tables are created in Table Editor

### Configure Authentication

1. Go to Authentication > Providers
2. Email provider should be enabled by default
3. Configure email templates (optional):
   - Go to Authentication > Email Templates
   - Customize signup confirmation, password reset, etc.

### Get Production API Keys

1. Go to Project Settings > API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Go to Project Settings > Service Keys
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ Keep this secret! Never expose client-side

## Step 2: Prepare Stripe for Production

### Activate Your Account

1. Complete Stripe onboarding
2. Verify business details
3. Add bank account for payouts
4. Switch to **Live Mode** in dashboard

### Get Production API Keys

1. In Stripe Dashboard (Live Mode)
2. Go to Developers > API keys
3. Copy these keys:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Configure Webhook (Temporarily)

We'll set up the webhook endpoint after deployment, but note the URL pattern:
```
https://YOUR-VERCEL-DOMAIN.com/api/webhooks/stripe
```

## Step 3: Push to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: clocko MVP"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git branch -M main
   git push -u origin main
   ```

## Step 4: Deploy to Vercel

### Connect Repository

1. Go to https://vercel.com
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Vercel will detect Next.js automatically

### Configure Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)

### Add Environment Variables

Click "Environment Variables" and add all of these:

```bash
# Supabase (from Step 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (from Step 2)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (add this after Step 5)

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN.vercel.app
```

**Important**:
- Add variables to "Production" environment
- You can also add to "Preview" and "Development" if needed

### Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. You'll get a deployment URL like `clocko.vercel.app`

### Update App URL

1. After deployment, copy your Vercel URL
2. Go to Vercel Project > Settings > Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` to your actual domain
4. Redeploy (Vercel > Deployments > ... > Redeploy)

## Step 5: Configure Production Stripe Webhook

### Create Webhook Endpoint

1. In Stripe Dashboard (Live Mode)
2. Go to Developers > Webhooks
3. Click "Add endpoint"
4. Enter URL: `https://YOUR-VERCEL-DOMAIN.vercel.app/api/webhooks/stripe`
5. Click "Select events" and choose:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
6. Click "Add endpoint"

### Add Webhook Secret to Vercel

1. Copy the **Signing secret** from the webhook details (starts with `whsec_`)
2. Go to Vercel Project > Settings > Environment Variables
3. Add or update:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
4. Click "Save"
5. Go to Deployments and redeploy

## Step 6: Configure Custom Domain (Optional)

### Add Domain to Vercel

1. Go to Vercel Project > Settings > Domains
2. Add your custom domain (e.g., `clocko.com`)
3. Follow Vercel's DNS instructions:
   - For apex domain: Add A record
   - For www: Add CNAME record

### Update Environment Variables

After domain is verified:

1. Update `NEXT_PUBLIC_APP_URL` to your custom domain
2. Update Stripe webhook URL to use custom domain
3. Update Supabase redirect URLs:
   - Go to Supabase > Authentication > URL Configuration
   - Add your production URL to allowed redirect URLs

### Update Stripe Webhook

1. In Stripe Webhooks, edit your endpoint
2. Update URL to: `https://your-domain.com/api/webhooks/stripe`
3. Save changes

## Step 7: Test Production Deployment

### Test Authentication

1. Go to your production URL
2. Sign up with a real email
3. Verify you can log in
4. Check Supabase > Authentication to see the user

### Test Subscription Flow

1. Log in to your production app
2. Go to Billing
3. Click "Start 7-Day Free Trial"
4. Complete checkout with test card:
   - Card: `4242 4242 4242 4242`
   - Or use a real card (you can cancel immediately)
5. Verify you're redirected to dashboard
6. Check Stripe Dashboard > Customers

### Test Webhooks

1. In Stripe Dashboard, go to Developers > Webhooks
2. Click on your production endpoint
3. Check "Recent deliveries" tab
4. Should see successful webhook deliveries
5. If failures, check:
   - Webhook secret is correct
   - Endpoint URL is correct
   - Check Vercel logs for errors

### Test Core Features

- [ ] Create a project
- [ ] Start timer
- [ ] Stop timer
- [ ] Add manual time entry
- [ ] Export CSV report
- [ ] Export PDF report
- [ ] Check subscription in billing page
- [ ] Access customer portal

## Step 8: Post-Deployment Checklist

### Security

- [ ] Environment variables are set correctly
- [ ] Service role key is not exposed client-side
- [ ] Webhook signature verification is working
- [ ] Row Level Security is enabled in Supabase
- [ ] HTTPS is enforced (automatic on Vercel)

### Functionality

- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Timers start and stop
- [ ] Projects can be created/edited/deleted
- [ ] Reports export successfully
- [ ] Stripe checkout works
- [ ] Webhooks are received
- [ ] Subscription enforcement works

### Performance

- [ ] Pages load quickly
- [ ] No console errors
- [ ] Images are optimized (if any)
- [ ] Fonts are loading correctly

### Monitoring

- [ ] Set up Vercel Analytics (optional)
- [ ] Monitor Stripe webhooks for failures
- [ ] Check Supabase usage/limits
- [ ] Set up error tracking (Sentry, LogRocket, etc.) - optional

## Step 9: Ongoing Maintenance

### Monitor Stripe Webhooks

- Check Stripe Dashboard > Webhooks regularly
- Set up email notifications for failed webhooks
- Retry failed webhooks if needed

### Monitor Supabase Usage

- Go to Supabase > Settings > Usage
- Check database size, API requests, auth users
- Upgrade plan if approaching limits

### Monitor Vercel

- Check Vercel Analytics for traffic
- Monitor function execution time
- Check bandwidth usage

### Database Backups

Supabase automatically backs up your database, but you can:
- Download manual backups via Supabase Dashboard
- Set up additional backup automation if needed

## Troubleshooting

### Deployment Fails

- Check build logs in Vercel
- Verify all environment variables are set
- Try building locally: `npm run build`

### Webhooks Not Received

- Verify endpoint URL is correct
- Check webhook secret matches
- Check Vercel function logs
- Ensure endpoint is publicly accessible

### Authentication Issues

- Verify Supabase URL and keys are correct
- Check allowed redirect URLs in Supabase
- Clear browser cache and cookies

### Database Connection Issues

- Verify Supabase is online
- Check database password
- Verify API keys are correct

## Rollback Procedure

If something goes wrong:

1. Go to Vercel > Deployments
2. Find a previous working deployment
3. Click "..." > "Promote to Production"
4. Previous version is now live

## Support Resources

- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Next.js: https://nextjs.org/docs

## Production URL

After deployment, your app will be available at:
- Vercel: `https://your-project.vercel.app`
- Custom domain: `https://your-domain.com`

🎉 Congratulations! clocko is now live in production.
