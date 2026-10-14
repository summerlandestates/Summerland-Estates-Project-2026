// Vercel Serverless Function for /api/places/:action
// (autocomplete, details, geocode, reverse-geocode)
// Delegates to the Express app in dev-server.js. Exists as a dedicated file so
// these routes resolve even if the [...route] catch-all isn't deployed.
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-expect-error dev-server.js has no type declarations
import app from '../../dev-server.js';

export const config = {
  api: { bodyParser: false },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
