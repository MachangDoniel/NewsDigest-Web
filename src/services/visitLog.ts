import type { NextFunction, Request, Response } from 'express';

// Reports each page load and API request to the NewsDigest Supabase project, so the iOS app's
// Admin screen can show website visitors next to app users. Off unless WEB_LOG_KEY is set
// (the same value as the WEB_LOG_KEY secret on the Supabase project).

interface Visit {
  at: string;
  action: string;
  ok: boolean;
  status: number;
  latencyMs: number;
  device: string;
  ip: string;
  userAgent: string;
}

// Limits so a bot hammering the site can't flood Supabase: one report every 30 seconds, at most
// 100 visits in it, and at most 30 of those from any one address. The rest are not logged.
const FLUSH_EVERY_MS = 30_000;
const MAX_QUEUED = 100;
const MAX_PER_IP = 30;

function detectDevice(ua: string): string {
  const lower = ua.toLowerCase();
  if (lower.includes('bot') || lower.includes('crawl') || lower.includes('spider')) return 'Bot';
  if (lower.includes('ipad') || lower.includes('tablet')) return 'Tablet';
  if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) return 'Mobile';
  if (lower.includes('macintosh') || lower.includes('windows') || lower.includes('linux')) return 'Desktop';
  return 'Other';
}

export function visitLog(supabaseUrl: string) {
  const key = process.env.WEB_LOG_KEY;
  if (!key) return (_req: Request, _res: Response, next: NextFunction) => next();

  let queue: Visit[] = [];
  let perIp = new Map<string, number>();
  const flush = async () => {
    perIp = new Map();
    if (!queue.length) return;
    const events = queue;
    queue = [];
    try {
      await fetch(`${supabaseUrl}/functions/v1/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Web-Log-Key': key },
        body: JSON.stringify({ action: 'log_web', events }),
      });
    } catch {
      // Losing a batch of visit counts is fine; never let it affect the site.
    }
  };
  setInterval(flush, FLUSH_EVERY_MS).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Page loads and API calls only; not scripts, styles or images.
    if (req.path !== '/' && !req.path.startsWith('/api/')) return next();
    const started = Date.now();
    // Read now: the dev server rewrites the URL of page loads before the response finishes.
    const action = `${req.method} ${req.path.replace(/\/\d+/g, '/:id')}`;
    res.on('finish', () => {
      const userAgent = String(req.headers['user-agent'] ?? '');
      const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
      const ip = (forwarded || req.ip || '').replace('::ffff:', '');
      const seen = perIp.get(ip) ?? 0;
      if (queue.length >= MAX_QUEUED || seen >= MAX_PER_IP) return;
      perIp.set(ip, seen + 1);
      queue.push({
        at: new Date(started).toISOString(),
        action,
        ok: res.statusCode < 400,
        status: res.statusCode,
        latencyMs: Date.now() - started,
        device: detectDevice(userAgent),
        ip,
        userAgent,
      });
    });
    next();
  };
}
