// Reference implementation for a public write endpoint (contact / newsletter).
// Path in a Next.js App Router project: app/api/contact/route.ts
//
// I did NOT test Cynbit's real endpoints. This shows the controls I would
// expect on any public form handler:
//   1. origin check          (basic CSRF defence for browser JSON posts)
//   2. content-type + size   (reject oversized / wrong-format bodies early)
//   3. rate limiting         (per client IP)
//   4. honeypot field        (silent success for bots, no signal for them)
//   5. schema validation     (typed, trimmed, length-limited)
//   6. consistent errors     (RFC 9457 application/problem+json, no internals)
//   7. safe logging          (request id, no personal data)
//
// Written for zod v3 (npm i zod@3). Uses only the standard Request/Response API.

import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(10).max(2000),
});

const ALLOWED_ORIGINS = new Set(['https://www.cynbit.in', 'https://cynbit.in']);
const MAX_BODY_CHARS = 10_000;

// --- rate limiting ---------------------------------------------------------
// DEMO ONLY: an in-memory map is per serverless instance, so limits are not
// shared across instances. In production use a shared store (Upstash Redis,
// Vercel KV, or the platform's WAF rate limiting).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, now: number = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (now - times[times.length - 1] > WINDOW_MS) hits.delete(k);
    }
  }
  return recent.length > MAX_REQUESTS;
}

// --- responses -------------------------------------------------------------
function problem(
  status: number,
  title: string,
  extra: Record<string, unknown> = {},
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify({ type: 'about:blank', title, status, ...extra }), {
    status,
    headers: {
      'Content-Type': 'application/problem+json',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function ok(status: number): Response {
  return new Response(JSON.stringify({ ok: true }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// Replace with the real delivery (email service, queue, CRM). Keep it behind
// a function so failures are handled in one place.
export async function deliver(_data: z.infer<typeof ContactSchema>): Promise<void> {
  // await resend.emails.send({ ... })
}

export async function POST(req: Request): Promise<Response> {
  const requestId = crypto.randomUUID();

  // 1. Origin check
  const origin = req.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return problem(403, 'Forbidden', { instance: requestId });
  }

  // 2. Content type and size
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.startsWith('application/json')) {
    return problem(415, 'Unsupported Media Type', { instance: requestId });
  }

  // 3. Rate limit (x-forwarded-for is set by the platform proxy)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return problem(429, 'Too Many Requests', { instance: requestId }, { 'Retry-After': '600' });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) {
    return problem(413, 'Payload Too Large', { instance: requestId });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return problem(400, 'Malformed JSON', { instance: requestId });
  }

  // 4. Honeypot: a hidden "company" input that real users never fill in.
  //    Pretend success so bots get no feedback to adapt to.
  if (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Record<string, unknown>).company === 'string' &&
    ((body as Record<string, string>).company).length > 0
  ) {
    return ok(202);
  }

  // (Optional) verify a Turnstile / hCaptcha token server-side here.

  // 5. Validation
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return problem(422, 'Validation failed', {
      instance: requestId,
      errors: parsed.error.flatten().fieldErrors, // field -> messages only
    });
  }

  // 6/7. Delivery with generic failure and no personal data in logs
  try {
    await deliver(parsed.data);
  } catch (err) {
    console.error('contact_delivery_failed', {
      requestId,
      error: err instanceof Error ? err.name : 'unknown',
    });
    return problem(502, 'Could not deliver your message', { instance: requestId });
  }

  return ok(201);
}
