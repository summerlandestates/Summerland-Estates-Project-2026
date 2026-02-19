import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { priceAmount, email, metadata } = JSON.parse(event.body || '{}');

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: metadata.planName,
              description: `${metadata.profileType} - ${metadata.planName}`,
            },
            unit_amount: Math.round(parseFloat(priceAmount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: {
        ...metadata,
        email,
      },
      success_url: `${process.env.URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/checkout`,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error: any) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
