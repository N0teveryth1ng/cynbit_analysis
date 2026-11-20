# 03. Security and data-handling findings

Evidence references point to files in [`../evidence/`](../evidence/). Fixes are in [`05-recommendations.md`](05-recommendations.md) and [`../snippets/`](../snippets/).

## Summary

| ID | Finding | Severity | Confidence |
|---|---|---|---|
| SEC-01 | No Content-Security-Policy | Medium | Verified |
| SEC-02 | No clickjacking protection | Low | Verified |
| SEC-03 | No `X-Content-Type-Options` | Low | Verified |
| SEC-04 | `Referrer-Policy` and `Permissions-Policy` not set | Low | Verified |
| SEC-05 | Wildcard CORS on the HTML document | Low | Verified (scope limited) |
| SEC-06 | HSTS without `includeSubDomains` / `preload` | Informational | Verified |
| SEC-07 | Third-party auth-service request from public pages | Low | Request verified, purpose unverified |
| SEC-08 | Analytics may fire before consent | Medium if confirmed | Needs verification |

---

## SEC-01: No Content-Security-Policy
**Severity:** Medium. **Category:** Security headers. **Confidence:** Verified.

**Observed.** The response has no `Content-Security-Policy` header ([evidence](../evidence/headers-securityheaders.txt)). The page loads script from `googletagmanager.com`, styles and fonts from Google, and connects to `analytics.google.com` and `auth.service.tealhq.com`. Observatory scores the site 50/100, C ([evidence](../evidence/observatory.md)).

**Why it matters.** A CSP is the browser-enforced allowlist that limits what injected or compromised script can do. Without it, a single XSS bug or a compromised third-party script has a much larger blast radius. The site makes several third-party calls, so the exposure is real, even though no vulnerability was observed.

**Fix.** Roll out in `Content-Security-Policy-Report-Only` first, review violations, then enforce. Longer term, move from `'unsafe-inline'` to nonces. See [`snippets/next.config.js`](../snippets/next.config.js).

## SEC-02: No clickjacking protection
**Severity:** Low. **Confidence:** Verified.

**Observed.** No `X-Frame-Options`, and no CSP `frame-ancestors` (there is no CSP at all).

**Why it matters.** Any other site can embed this one in a frame. The contact form is the only interactive surface worth overlaying, so impact is limited.

**Fix.** `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'` in the CSP.

## SEC-03: No `X-Content-Type-Options`
**Severity:** Low. **Confidence:** Verified.

**Why it matters.** Without `nosniff`, browsers may guess a content type for a response, which can turn an upload or misconfigured asset into script. Low risk for a static marketing site, but it is a one-line fix.

**Fix.** `X-Content-Type-Options: nosniff`.

## SEC-04: `Referrer-Policy` and `Permissions-Policy` not set
**Severity:** Low. **Confidence:** Verified.

**Observed.** Neither header is sent. In DevTools the request showed `strict-origin-when-cross-origin`, which is the **browser default**, so real exposure today is small.

**Why it matters.** Relying on a default means a future browser change alters behaviour silently. `Permissions-Policy` limits camera, microphone and geolocation, none of which a marketing site needs.

**Fix.** Set both explicitly (see snippet).

## SEC-05: `Access-Control-Allow-Origin: *` on the HTML document
**Severity:** Low. **Confidence:** Verified for `/`; other routes untested.

**Observed.** The homepage response includes `access-control-allow-origin: *`, which the scanner flags as lax.

**Why it matters.** For a public, cookie-less static page this exposes nothing sensitive. It matters if the same setting reaches an endpoint that returns user-specific data or sits behind authentication. I did not determine whether it comes from the platform defaults or project configuration.

**Fix.** Remove it where cross-origin reads are not needed. If an API is added later, set CORS per route with an explicit origin allowlist.

## SEC-06: HSTS without `includeSubDomains` / `preload`
**Severity:** Informational. **Confidence:** Verified.

**Observed.** `strict-transport-security: max-age=63072000` (2 years), which is a strong value.

**Note.** Add `includeSubDomains` only after confirming every subdomain (including product apps) serves valid HTTPS. `preload` is a larger commitment and optional.

## SEC-07: Third-party auth-service request from public pages
**Severity:** Low. **Confidence:** Request verified; purpose unverified.

**Observed.** On first load, the homepage's JavaScript triggers `GET https://auth.service.tealhq.com/jwt_public_key` ([evidence](../evidence/devtools-observations.md)). No cookies were attached. Cynbit's relationship to this service, and what it is used for, was not verified.

**Why it matters.**
- A public key itself is meant to be public; this is **not** a credential leak.
- Every visitor's IP address, user agent and referrer are disclosed to a third party before any interaction, which is a privacy and disclosure consideration.
- Page behaviour now depends on a service Cynbit may not operate.
- Nothing on the homepage appears to need token verification.

**Fix.** Confirm why it is requested. If it supports a product widget (for example Cynbit Studio), load it only on the routes that use it, and mention it in the privacy policy.

## SEC-08: Analytics may fire before consent
**Severity:** Medium if confirmed. **Confidence:** Needs verification.

**Observed.** Google Tag Manager loads and a GA4 `page_view` is sent on first view ([evidence](../evidence/devtools-observations.md)). The fetched homepage text contained no cookie-consent banner. I did not test in a clean incognito session, so I cannot say whether consent is requested elsewhere.

**Why it matters.** Depending on audience and jurisdiction (for example the DPDP Act 2023 in India, or GDPR for EU visitors), analytics cookies and tracking may require prior consent. This is a compliance question for whoever owns the policy, and I am not giving legal advice.

**Verify.** Open an incognito window with DevTools Network open, load the site, and check whether `collect?v=2` fires before any choice is offered.

**Fix.** Gate analytics behind consent; see [`snippets/consent-analytics.tsx`](../snippets/consent-analytics.tsx).

---

## Positive controls

| Control | Evidence |
|---|---|
| HSTS with a 2-year lifetime | `strict-transport-security: max-age=63072000` |
| Valid TLS, automatic renewal pattern, modern chain | [TLS evidence](../evidence/tls-and-availability.md) |
| HTTP/2, edge caching, gzip compression | Response headers |
| Statically prerendered homepage, so no server-side logic on the homepage request | `x-nextjs-prerender: 1` |
| No first-party session or auth cookie on the marketing site | Request cookies: only `_ga*` |
| Custom `error`, `not-found` and `global-error` boundaries | Loaded chunks |
| Platform-managed `x-powered-by` is not exposed | Absent from response headers |

## Hypotheses requiring verification (not findings)

| Area | What would need checking |
|---|---|
| Contact and newsletter endpoints | Server-side validation, rate limiting, CAPTCHA or honeypot, CSRF protection, error format, double opt-in |
| Email domain | SPF, DKIM and DMARC records for `cynbit.in` |
| Vulnerability disclosure | Presence of `/.well-known/security.txt` |
| Source maps | Whether production `.js.map` files are served |
| 404 and error pages | Whether they return correct status codes and no framework details |
