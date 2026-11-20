// Fixes SEC-01 to SEC-05 and PERF-03.
// Drop into the project root as next.config.js (merge with any existing config).
//
// Roll the CSP out in REPORT-ONLY mode first. Watch the browser console / a
// report endpoint for violations, adjust the allowlist, then switch the header
// name to 'Content-Security-Policy' to enforce it.

/** Sources the current site is observed to use (see evidence/devtools-observations.md). */
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is a pragmatic start for Next.js inline bootstrap scripts.
  // Move to per-request nonces (middleware) to drop it.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
  "connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://auth.service.tealhq.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Strict-Transport-Security is already sent (max-age=63072000). Add
  // includeSubDomains only after every subdomain is confirmed HTTPS-only.
];

/** @type {import('next').NextConfig} */
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Non-fingerprinted files in /public (logo.svg, favicon.svg, images).
        // A day in the browser, a week of stale-while-revalidate; avoids a
        // revalidation round trip on every visit without freezing the files.
        // Do NOT use "immutable" here unless the filenames carry a content hash.
        source: '/:all*(svg|png|jpg|jpeg|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // SEC-05: if Access-Control-Allow-Origin: * is coming from this project's
  // configuration (for example a vercel.json "headers" block), remove it.
  // Add CORS per API route with an explicit origin allowlist instead.
};
