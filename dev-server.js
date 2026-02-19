// Simple Express server to handle API routes in development
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY not found in .env file');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceAmount, email, metadata } = req.body;

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
            unit_amount: Math.round(parseFloat(priceAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: metadata,
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/checkout`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
