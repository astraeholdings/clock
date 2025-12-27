# clocko - Time Tracking for Freelancers

A production-ready SaaS application for freelancers to track billable time, manage projects, and export professional reports.

## Features

- **Email/Password Authentication** - Secure signup and login with Supabase
- **Project Management** - Create unlimited projects with custom hourly rates
- **Time Tracking** - Start/stop timer or add manual time entries
- **Dashboard** - View total hours and revenue at a glance
- **Reports** - Export time entries as CSV or PDF
- **Stripe Subscriptions** - $8/month with 7-day free trial
- **Access Control** - App becomes read-only when subscription is inactive

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe (Subscriptions + Customer Portal)
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Vercel account (for deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd clock
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the database migration:
   - Go to SQL Editor in Supabase Dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL to create tables, policies, and triggers

3. Configure Authentication:
   - Go to Authentication > Providers
   - Enable Email provider
   - Disable email confirmations for development (optional)

4. Get your API keys:
   - Go to Project Settings > API
   - Copy the Project URL and anon/public key
   - Go to Project Settings > Service Keys
   - Copy the service_role key (keep this secret!)

### 4. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)

2. Get your API keys:
   - Go to Developers > API keys
   - Copy your publishable key and secret key
   - Use test mode keys for development

3. Set up webhooks:
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret

4. For production:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`
   - Copy the webhook signing secret

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for reference.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test Stripe Webhooks Locally

In a separate terminal, run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables (same as `.env.local` but with production values)
   - Set `NEXT_PUBLIC_APP_URL` to your production domain

3. Deploy!

### Configure Production Stripe Webhooks

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-vercel-domain.com/api/webhooks/stripe`
3. Select the required events (listed above)
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel with the new signing secret

### Database Migrations

The database schema is already set up via the SQL migration file. For production:

1. Create a new Supabase project
2. Run the migration SQL from `supabase/migrations/001_initial_schema.sql`
3. Update environment variables with production Supabase credentials

## Database Schema

### users
- `id` - UUID (foreign key to auth.users)
- `email` - User email
- `stripe_customer_id` - Stripe customer ID
- `subscription_status` - Subscription status (active/inactive/past_due)
- `subscription_id` - Stripe subscription ID
- `trial_ends_at` - Trial end timestamp
- `created_at` - Account creation timestamp

### projects
- `id` - UUID
- `user_id` - Foreign key to users
- `name` - Project name
- `hourly_rate` - Hourly rate (numeric)
- `created_at` - Creation timestamp

### time_entries
- `id` - UUID
- `user_id` - Foreign key to users
- `project_id` - Foreign key to projects
- `start_time` - Entry start timestamp
- `end_time` - Entry end timestamp
- `duration_seconds` - Calculated duration
- `created_at` - Creation timestamp

## Application Routes

- `/` - Marketing landing page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Main dashboard with timer and stats
- `/projects` - Project management (CRUD)
- `/reports` - Time entries table with manual entry and export
- `/billing` - Subscription management and Stripe portal

## Subscription Enforcement

The app enforces subscription status:

- **Active subscription or trial**: Full access to all features
- **Inactive subscription**: Read-only mode
  - Cannot start/stop timers
  - Cannot create/edit/delete projects
  - Cannot add manual time entries
  - Cannot export reports
  - Can view existing data

## Testing Stripe Subscriptions

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

Use any future expiration date and any CVC.

## Project Structure

```
clock/
├── app/
│   ├── actions/          # Server actions
│   ├── api/webhooks/     # Stripe webhooks
│   ├── billing/          # Billing page
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── projects/         # Projects page
│   ├── reports/          # Reports page
│   ├── signup/           # Signup page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # React components
├── lib/
│   ├── supabase/         # Supabase clients
│   └── stripe.ts         # Stripe configuration
├── supabase/migrations/  # Database migrations
├── utils/                # Utility functions
├── .env.example          # Environment variables template
├── middleware.ts         # Next.js middleware
└── README.md             # This file
```

## Security Notes

- Never commit `.env.local` or expose API keys
- Use Supabase Row Level Security (RLS) - already configured
- Stripe webhooks verify signatures
- Service role key only used server-side
- All user operations are scoped to authenticated user

## Support & Documentation

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## License

Proprietary - All rights reserved
