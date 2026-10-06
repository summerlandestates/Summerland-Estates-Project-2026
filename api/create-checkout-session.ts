// Vercel Serverless Function for Stripe Checkout.
// Delegates to the Express app in dev-server.js so the checkout logic
// (amount validation, plan-price check, metadata) lives in one place.
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-expect-error dev-server.js has no type declarations
import app from '../dev-server.js';

export const config = {
  api: { bodyParser: false },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  req.url = '/api/create-checkout-session';
  return app(req, res);
}
