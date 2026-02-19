// Vercel Serverless Function for Stripe Checkout
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceAmount, email, metadata } = req.body;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: metadata.planName || 'Premium Plan',
              description: `${metadata.selectedTier} - Summerland Estates`,
            },
            unit_amount: Math.round(parseFloat(priceAmount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: metadata,
      success_url: `${req.headers.origin || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/checkout`,
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
