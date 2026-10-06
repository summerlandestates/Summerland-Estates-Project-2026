// Catch-all Vercel function for all other dev-server API routes
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-expect-error dev-server.js has no type declarations
import app from '../dev-server.js';

// Vercel parses JSON bodies by default, which would break Stripe webhook
// signature verification (needs the raw body). Disable it so Express's own
// express.json()/express.raw() middleware handles parsing per-route.
export const config = {
  api: { bodyParser: false },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
