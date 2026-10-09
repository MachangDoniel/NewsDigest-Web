import type { NextFunction, Request, Response } from 'express';

// Per-address request limits, so a bot can't use up the Gemini quota or slow the site for readers.
// Counts are kept in memory for one minute at a time; a restart clears them.

const WINDOW_MS = 60_000;

/** Allows `max` requests a minute from one address; the rest get 429 until the minute is over. */
export function rateLimit(max: number) {
  let windowStart = Date.now();
  let counts = new Map<string, number>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (now - windowStart >= WINDOW_MS) {
      windowStart = now;
      counts = new Map();
    }
    const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
    const ip = forwarded || req.ip || 'unknown';
    const seen = (counts.get(ip) ?? 0) + 1;
    counts.set(ip, seen);
    if (seen > max) {
      const retryAfter = Math.ceil((WINDOW_MS - (now - windowStart)) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      const message = `Too many requests. Try again in ${retryAfter} seconds.`;
      return res.status(429).json({ ok: false, error: message, message });
    }
    next();
  };
}
