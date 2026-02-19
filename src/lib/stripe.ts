import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export { stripePromise };
