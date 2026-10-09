import type { NextFunction, Request, Response } from 'express';

// Per-address request limits, so a bot can't use up the Gemini quota or slow the site for readers.
// Counts are kept in memory for one minute at a time; a restart clears them.

const WINDOW_MS = 60_000;
const DAY_MS = 24 * 60 * 60_000;

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

/** Allows `perMinute` and `perDay` requests from all addresses together; the rest get 429. */
export function totalLimit(perMinute: number, perDay: number) {
  let minuteStart = Date.now();
  let dayStart = Date.now();
  let inMinute = 0;
  let inDay = 0;

  return (_req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (now - minuteStart >= WINDOW_MS) {
      minuteStart = now;
      inMinute = 0;
    }
    if (now - dayStart >= DAY_MS) {
      dayStart = now;
      inDay = 0;
    }
    if (inDay >= perDay || inMinute >= perMinute) {
      const waitMs = inDay >= perDay ? DAY_MS - (now - dayStart) : WINDOW_MS - (now - minuteStart);
      res.setHeader('Retry-After', String(Math.ceil(waitMs / 1000)));
      const message = 'The AI tutor is busy right now. Please try again later.';
      return res.status(429).json({ ok: false, error: message, message });
    }
    inMinute += 1;
    inDay += 1;
    next();
  };
}
