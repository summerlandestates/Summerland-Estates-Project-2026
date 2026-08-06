// Catch-all Vercel function for all other dev-server API routes
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../dev-server.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
