# Stripe Payment Integration Setup Guide

## Overview
The Summerland Estates platform now includes Stripe payment integration for handling paid membership plans. Free and community plans bypass payment processing.

## Setup Instructions

### 1. Get Your Stripe API Keys

1. Create a Stripe account at https://stripe.com
2. Go to Developers > API keys
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 2. Configure Environment Variables

Add your Stripe publishable key to your `.env` file:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important:** Never commit your `.env` file to version control. The `.env.example` file shows the required variables.

### 3. Backend Setup (Required for Production)

For production, you'll need to:

1. **Create Stripe Products and Prices:**
   - Go to Stripe Dashboard > Products
   - Create products for each membership tier
   - Note the Price IDs (e.g., `price_1234567890`)

2. **Set up Stripe Webhook:**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Listen for events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

3. **Update Supabase Functions:**
   - Create Edge Functions to handle Stripe webhooks
   - Update user profiles with subscription status
   - Store Stripe customer IDs in profiles table

## Current Implementation

### Files Created

1. **`src/lib/stripe.ts`** - Stripe initialization
2. **`src/pages/CheckoutPage.tsx`** - Checkout and account creation page
3. **Updated `src/pages/AddListingPage.tsx`** - Form now navigates to checkout
4. **Updated `src/App.tsx`** - Added `/checkout` route

### Flow

1. User clicks "Sign In" or "Get Started" → Redirects to `/add-listing`
2. User selects profile type (Professional, Service Provider, Agency, Estates)
3. User completes 4-step onboarding
4. User selects pricing tier
5. User fills out account creation form (now horizontal layout)
6. Form submits → Navigates to `/checkout` with form data
7. Checkout page:
   - **Free/Community plans:** Creates account directly in Supabase
   - **Paid plans:** Currently creates account (Stripe Checkout integration pending)

### Account Creation Process

For **Free/Community Plans:**
- Account created immediately
- User receives verification email
- Redirected to login page

For **Paid Plans (Future):**
- Will redirect to Stripe Checkout
- After successful payment, webhook creates account
- User receives confirmation email

## Database Schema Updates Needed

Add to your `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_type TEXT;
```

## Testing

### Test Mode
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVC

### Test the Flow
1. Start at homepage
2. Click "Get Started"
3. Select a profile type
4. Complete onboarding steps
5. Select a **free** plan first to test account creation
6. Fill out the form
7. Verify account is created in Supabase

## Next Steps for Full Stripe Integration

1. **Create Stripe Checkout Session:**
   ```typescript
   // In CheckoutPage.tsx, replace placeholder with:
   const response = await fetch('/api/create-checkout-session', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       priceId: 'price_xxx', // From Stripe Dashboard
       email: checkoutData.email,
       metadata: checkoutData,
     }),
   });
   const { sessionId } = await response.json();
   const stripe = await stripePromise;
   await stripe.redirectToCheckout({ sessionId });
   ```

2. **Create Backend API Endpoint:**
   - Use Supabase Edge Functions or your backend
   - Create Stripe Checkout Session
   - Return session ID

3. **Handle Webhook Events:**
   - Listen for `checkout.session.completed`
   - Create user account in Supabase
   - Update profile with Stripe customer ID
   - Send welcome email

## Security Notes

- ✅ Publishable key is safe to expose in frontend
- ❌ Never expose Secret key in frontend code
- ✅ All payment processing happens on Stripe's servers
- ✅ Use webhooks to verify payments server-side
- ✅ Implement webhook signature verification

## Support

For Stripe integration questions:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For implementation help:
- Check `src/pages/CheckoutPage.tsx` for current implementation
- Review `ADMIN-PANEL-GUIDE.md` for admin features
